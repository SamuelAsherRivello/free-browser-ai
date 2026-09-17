create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table private.response_stats (
  provider text not null,
  model text not null,
  response_count bigint not null default 0 check (response_count >= 0),
  total_duration_ms bigint not null default 0 check (total_duration_ms >= 0),
  primary key (provider, model)
);

alter table private.response_stats enable row level security;

revoke all on table private.response_stats from public;
revoke all on table private.response_stats from anon, authenticated;

insert into private.response_stats (provider, model)
values
  ('transformers', 'onnx-community/Qwen2.5-0.5B-Instruct'),
  ('transformers', 'onnx-community/Qwen2.5-1.5B-Instruct'),
  ('webllm', 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'),
  ('webllm', 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC');

create function public.record_response_metric(
  p_provider text,
  p_model text,
  p_duration_ms integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_duration_ms is null or p_duration_ms < 1 or p_duration_ms > 3600000 then
    raise exception 'Response duration is outside the accepted range.'
      using errcode = '22023';
  end if;

  update private.response_stats
  set
    response_count = response_count + 1,
    total_duration_ms = total_duration_ms + p_duration_ms
  where provider = p_provider
    and model = p_model;

  if not found then
    raise exception 'Provider and model are not supported.'
      using errcode = '22023';
  end if;
end;
$$;

create function public.get_response_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'overall', jsonb_build_object(
      'response_count', coalesce(sum(response_count), 0),
      'average_response_ms', case
        when coalesce(sum(response_count), 0) = 0 then null
        else round(sum(total_duration_ms)::numeric / sum(response_count))::bigint
      end
    ),
    'by_provider_model', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'provider', provider,
          'model', model,
          'response_count', response_count,
          'average_response_ms', round(total_duration_ms::numeric / response_count)::bigint
        )
        order by provider, model
      ) filter (where response_count > 0),
      '[]'::jsonb
    )
  )
  from private.response_stats;
$$;

revoke all on function public.record_response_metric(text, text, integer) from public;
revoke all on function public.record_response_metric(text, text, integer) from anon, authenticated;
grant execute on function public.record_response_metric(text, text, integer) to anon;

revoke all on function public.get_response_stats() from public;
revoke all on function public.get_response_stats() from anon, authenticated;
grant execute on function public.get_response_stats() to anon;

comment on table private.response_stats is
  'Aggregate-only response timing totals. Contains no response events, timestamps, content, or visitor identifiers.';

comment on function public.record_response_metric(text, text, integer) is
  'Adds one validated anonymous duration directly into aggregate provider/model totals.';

comment on function public.get_response_stats() is
  'Returns public counts and averages without exposing cumulative totals or underlying rows.';
