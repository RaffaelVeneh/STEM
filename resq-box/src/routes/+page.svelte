<script>
  import { fly, scale } from 'svelte/transition';

  const levels = [
    { num: 1, title: 'Gempa!', icon: '🏚️', desc: 'Nyalakan alarm gempa', done: false },
    { num: 2, title: 'Jalur Evakuasi', icon: '💡', desc: 'Buat lampu evakuasi otomatis', done: false },
    { num: 3, title: 'Banjir Terdeteksi', icon: '🌊', desc: 'Program sensor banjir', done: false },
    { num: 4, title: 'Sistem Peringatan Dini', icon: '📢', desc: 'Multi-sensor warning system', done: false },
    { num: 5, title: 'Desa Tangguh', icon: '🏘️', desc: 'Bangun smart village anti-bencana', done: false },
  ];
</script>

<svelte:head>
  <title>RESQ-BOX — Beranda</title>
</svelte:head>

<div class="space-y-8" in:fly={{ y: 20, duration: 400 }}>
  <!-- Hero -->
  <div class="text-center py-8" in:scale={{ duration: 500, start: 0.9 }}>
    <div class="text-7xl mb-4 animate-bounce-gentle">🦉</div>
    <h1 class="font-display font-bold text-4xl text-ocean-deep mb-2">
      Selamat Datang di RESQ-BOX!
    </h1>
    <p class="text-lg text-earth-brown/70 max-w-xl mx-auto">
      Belajar coding sambil menyelamatkan dunia! Susun blok, simulasi sensor, dan jadilah pahlawan tangguh bencana.
    </p>
    <div class="flex justify-center gap-4 mt-6">
      <a href="/workshop" class="btn-primary no-underline inline-block">🧩 Mulai Coding</a>
      <a href="/quests" class="btn-play no-underline inline-block">🎯 Lihat Misi</a>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
    <div class="card text-center">
      <div class="text-3xl mb-1">⭐</div>
      <div class="font-display font-bold text-2xl text-safety-orange">0</div>
      <div class="text-sm text-earth-brown/60">XP Points</div>
    </div>
    <div class="card text-center">
      <div class="text-3xl mb-1">🏆</div>
      <div class="font-display font-bold text-2xl text-safety-yellow">0</div>
      <div class="text-sm text-earth-brown/60">Badges</div>
    </div>
    <div class="card text-center">
      <div class="text-3xl mb-1">🎯</div>
      <div class="font-display font-bold text-2xl text-safety-green">0/5</div>
      <div class="text-sm text-earth-brown/60">Misi Selesai</div>
    </div>
  </div>

  <!-- XP Bar -->
  <div class="max-w-2xl mx-auto">
    <div class="flex justify-between text-sm text-earth-brown/70 mb-1">
      <span>Level 1 — Pemula Tangguh</span>
      <span>0 / 100 XP</span>
    </div>
    <div class="xp-bar">
      <div class="xp-bar-fill" style="width: 0%"></div>
    </div>
  </div>

  <!-- Level Progress -->
  <div class="max-w-4xl mx-auto">
    <h2 class="font-display font-bold text-2xl text-ocean-deep mb-4 text-center">
      📋 Perjalanan Misi
    </h2>
    <div class="grid grid-cols-5 gap-3">
      {#each levels as level, i}
        <div class="quest-card text-center p-4 {level.done ? 'completed' : ''}">
          <div class="text-3xl mb-2">{level.icon}</div>
          <div class="badge-xp text-xs mb-1">Level {level.num}</div>
          <h3 class="font-display font-semibold text-sm text-ocean-deep">{level.title}</h3>
          <p class="text-xs text-earth-brown/60 mt-1">{level.desc}</p>
          {#if level.done}
            <div class="mt-2 text-safety-green text-lg">✅</div>
          {:else}
            <div class="mt-2 text-earth-brown/30 text-lg">🔒</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
