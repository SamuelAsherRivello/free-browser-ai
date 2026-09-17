begin;

do $$
declare
  actual_columns text[];
begin
  select array_agg(column_name::text order by ordinal_position)
  into actual_columns
  from information_schema.columns
  where table_schema = 'private'
    and table_name = 'response_stats';

  assert actual_columns = array[
    'provider',
    'model',
    'response_count',
    'total_duration_ms'
  ], 'response_stats must contain only aggregate fields';

  assert (
    select count(*) = 4
    from private.response_stats
  ), 'exactly four supported provider/model pairs must be seeded';

  assert not has_schema_privilege('anon', 'private', 'USAGE'),
    'anon must not have private schema usage';
  assert not has_table_privilege('anon', 'private.response_stats', 'SELECT'),
    'anon must not select aggregate state directly';
  assert not has_table_privilege('anon', 'private.response_stats', 'UPDATE'),
    'anon must not update aggregate state directly';
  assert not has_table_privilege('anon', 'private.response_stats', 'DELETE'),
    'anon must not delete aggregate state';
  assert has_function_privilege(
    'anon',
    'public.record_response_metric(text,text,integer)',
    'EXECUTE'
  ), 'anon must execute the validated submission RPC';
  assert has_function_privilege(
    'anon',
    'public.get_response_stats()',
    'EXECUTE'
  ), 'anon must execute the aggregate read RPC';
  assert not has_function_privilege(
    'authenticated',
    'public.record_response_metric(text,text,integer)',
    'EXECUTE'
  ), 'authenticated must not inherit the anonymous submission RPC';
  assert not has_function_privilege(
    'authenticated',
    'public.get_response_stats()',
    'EXECUTE'
  ), 'authenticated must not inherit the anonymous aggregate RPC';
end;
$$;

set local role anon;
select public.record_response_metric(
  'transformers',
  'onnx-community/Qwen2.5-0.5B-Instruct',
  1250
);
reset role;

do $$
declare
  stats jsonb;
begin
  assert (
    select response_count = 1 and total_duration_ms = 1250
    from private.response_stats
    where provider = 'transformers'
      and model = 'onnx-community/Qwen2.5-0.5B-Instruct'
  ), 'valid submissions must atomically update count and total';

  stats := public.get_response_stats();
  assert stats #>> '{overall,response_count}' = '1',
    'overall count must include the controlled sample';
  assert stats #>> '{overall,average_response_ms}' = '1250',
    'overall average must match the controlled sample';
  assert not (stats::text like '%total_duration_ms%'),
    'public output must omit cumulative totals';
end;
$$;

select public.record_response_metric(
  'transformers',
  'onnx-community/Qwen2.5-1.5B-Instruct',
  1
);

select public.record_response_metric(
  'webllm',
  'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
  3600000
);

do $$
begin
  assert (
    select response_count = 1 and total_duration_ms = 1
    from private.response_stats
    where provider = 'transformers'
      and model = 'onnx-community/Qwen2.5-1.5B-Instruct'
  ), 'the one millisecond lower boundary must be accepted';
  assert (
    select response_count = 1 and total_duration_ms = 3600000
    from private.response_stats
    where provider = 'webllm'
      and model = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
  ), 'the 3,600,000 millisecond upper boundary must be accepted';
end;
$$;

do $$
begin
  begin
    perform public.record_response_metric(
      'transformers',
      'onnx-community/Qwen2.5-0.5B-Instruct',
      0
    );
    raise exception 'zero duration unexpectedly succeeded';
  exception
    when sqlstate '22023' then null;
  end;

  begin
    perform public.record_response_metric(
      'transformers',
      'onnx-community/Qwen2.5-0.5B-Instruct',
      3600001
    );
    raise exception 'oversized duration unexpectedly succeeded';
  exception
    when sqlstate '22023' then null;
  end;

  begin
    perform public.record_response_metric('unknown', 'unknown-model', 1000);
    raise exception 'unsupported provider/model unexpectedly succeeded';
  exception
    when sqlstate '22023' then null;
  end;
end;
$$;

set local role anon;
select public.get_response_stats();
reset role;

rollback;
