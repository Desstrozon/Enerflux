@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Laravel')
<img src="{{ rtrim(config('app.url'), '/') }}/public/brand/Enerflux.png" class="logo" alt="Enerflux Logo">
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>
