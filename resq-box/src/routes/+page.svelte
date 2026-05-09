<script>
  import { fly, scale } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { QUESTS } from '$lib/quests/definitions.js';
  import { xp, badges, questStatus, xpProgress, xpToNextLevel } from '$lib/stores/gamification.js';

  let currentXp = $state(0);
  let currentBadges = $state(0);
  let missionsDone = $state(0);
  let xpBarWidth = $state(0);
  let xpNext = $state(100);
  let levels = $state([]);
  let greeting = $state('Selamat Datang');
  let playerLevel = $state(1);

  $effect(() => {
    currentXp = $xp;
    currentBadges = $badges.length;
    missionsDone = Object.values($questStatus).filter(s => s === 'completed').length;
    levels = QUESTS.map(q => ({
      num: q.id, title: q.title, icon: q.icon, desc: q.desc,
      done: $questStatus[q.id] === 'completed',
      locked: $questStatus[q.id] === 'locked',
    }));
    xpBarWidth = $xpProgress;
    xpNext = $xpToNextLevel;
    if (currentXp >= 1000) playerLevel = 5;
    else if (currentXp >= 500) playerLevel = 4;
    else if (currentXp >= 250) playerLevel = 3;
    else if (currentXp >= 100) playerLevel = 2;
  });

  $effect(() => {
    const h = new Date().getHours();
    if (h < 11) greeting = 'Selamat Pagi';
    else if (h < 15) greeting = 'Selamat Siang';
    else if (h < 19) greeting = 'Selamat Sore';
    else greeting = 'Selamat Malam';
  });

  const levelTitles = ['', 'Pemula Tangguh', 'Siaga Bencana', 'Pahlawan Mitigasi', 'Guardian Desa', 'Legenda Tangguh'];
</script>

<svelte:head>
  <title>RESQ-BOX — Beranda</title>
</svelte:head>

<div style="padding: 1rem 2rem 2rem; max-width: 1200px; margin: 0 auto;" in:fly={{ y: 20, duration: 400 }}>

  <!-- ═══════ HERO ═══════ -->
  <div style="
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    padding: 3rem 2.5rem;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #1D3557 0%, #2C4A6E 35%, #457B9D 70%, #1D3557 100%);
  " in:scale={{ duration: 600, start: 0.95 }}>
    
    <!-- Decorative blobs -->
    <div style="position:absolute; top:-60px; right:-30px; width:200px; height:200px; border-radius:50%; background:var(--color-safety-yellow); opacity:0.08;"></div>
    <div style="position:absolute; bottom:-40px; left:-20px; width:150px; height:150px; border-radius:50%; background:var(--color-safety-orange); opacity:0.10;"></div>
    <div style="position:absolute; top:50%; right:35%; width:80px; height:80px; border-radius:50%; background:var(--color-safety-green); opacity:0.12;"></div>

    <div style="position:relative; display:flex; align-items:center; gap:2rem;">
      <!-- Siaga -->
      <div class="animate-bounce-gentle" style="
        flex-shrink:0;
        font-size:6rem;
        line-height:1;
        filter: drop-shadow(0 12px 24px rgba(0,0,0,0.3));
        user-select:none;
      ">🦉</div>

      <div style="flex:1; min-width:0;">
        <p style="
          font-family:var(--font-display);
          font-weight:600;
          font-size:0.8rem;
          letter-spacing:0.1em;
          text-transform:uppercase;
          color:var(--color-ocean-foam);
          margin:0 0 0.5rem;
          opacity:0.8;
        ">{greeting}, Pahlawan Tangguh! 👋</p>

        <h1 style="
          font-family:var(--font-display);
          font-weight:800;
          font-size:clamp(2rem, 4vw, 3.5rem);
          color:#fff;
          margin:0 0 0.75rem;
          line-height:1.15;
        ">
          RESQ<span style="color:var(--color-safety-yellow);">-</span>BOX
        </h1>

        <p style="
          font-size:1.05rem;
          line-height:1.6;
          color:var(--color-ocean-foam);
          margin:0 0 1.5rem;
          max-width:460px;
          opacity:0.9;
        ">
          Belajar coding sambil menyelamatkan dunia! Susun blok, simulasi sensor Arduino, dan jadilah <strong style="color:var(--color-safety-yellow);">Pahlawan Tangguh Bencana</strong>.
        </p>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <a href="/workshop" style="
            display:inline-flex; align-items:center; gap:0.5rem;
            padding:0.8rem 1.75rem;
            border-radius:1rem;
            font-family:var(--font-display);
            font-weight:700;
            font-size:1rem;
            text-decoration:none;
            background:var(--color-safety-orange);
            color:#fff;
            box-shadow:0 6px 20px rgba(255,107,53,0.4);
            transition:all 0.2s;
            border:none;
            cursor:pointer;
          "
          onmouseenter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
          onmouseleave={(e) => e.currentTarget.style.transform = ''}
          >
            🧩 Mulai Coding
          </a>
          <a href="/quests" style="
            display:inline-flex; align-items:center; gap:0.5rem;
            padding:0.8rem 1.75rem;
            border-radius:1rem;
            font-family:var(--font-display);
            font-weight:700;
            font-size:1rem;
            text-decoration:none;
            background:rgba(255,255,255,0.12);
            color:#fff;
            backdrop-filter:blur(8px);
            border:2px solid rgba(255,255,255,0.2);
            transition:all 0.2s;
            cursor:pointer;
          "
          onmouseenter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
          onmouseleave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          >
            🎯 Lihat Misi
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══════ STATS CARDS ═══════ -->
  <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem;">
    <!-- XP -->
    <div style="
      position:relative; overflow:hidden;
      border-radius:1.25rem;
      padding:1.5rem;
      text-align:center;
      background:linear-gradient(135deg, #FFF3E0, #FFE0B2);
      border:2px solid color-mix(in srgb, var(--color-safety-orange) 25%, transparent);
      box-shadow:0 2px 8px rgba(0,0,0,0.04);
    " in:fly={{ y: 20, delay: 100 }}>
      <div style="position:absolute; top:-20px; right:-20px; font-size:5rem; opacity:0.15; line-height:1;">⭐</div>
      <div style="font-size:2rem; margin-bottom:0.25rem; position:relative;">⭐</div>
      <div style="font-family:var(--font-display); font-weight:800; font-size:2.25rem; color:var(--color-safety-orange); line-height:1.2; position:relative;">{currentXp.toLocaleString()}</div>
      <div style="font-size:0.8rem; font-weight:600; color:var(--color-earth-brown); opacity:0.7; margin-top:0.15rem;">XP Points</div>
    </div>

    <!-- Badges -->
    <div style="
      position:relative; overflow:hidden;
      border-radius:1.25rem;
      padding:1.5rem;
      text-align:center;
      background:linear-gradient(135deg, #FFFDE7, #FFF9C4);
      border:2px solid color-mix(in srgb, var(--color-safety-yellow) 25%, transparent);
      box-shadow:0 2px 8px rgba(0,0,0,0.04);
    " in:fly={{ y: 20, delay: 150 }}>
      <div style="position:absolute; top:-20px; right:-20px; font-size:5rem; opacity:0.15; line-height:1;">🏆</div>
      <div style="font-size:2rem; margin-bottom:0.25rem; position:relative;">🏆</div>
      <div style="font-family:var(--font-display); font-weight:800; font-size:2.25rem; color:#F9A825; line-height:1.2; position:relative;">{currentBadges}</div>
      <div style="font-size:0.8rem; font-weight:600; color:var(--color-earth-brown); opacity:0.7; margin-top:0.15rem;">Lencana</div>
    </div>

    <!-- Missions -->
    <div style="
      position:relative; overflow:hidden;
      border-radius:1.25rem;
      padding:1.5rem;
      text-align:center;
      background:linear-gradient(135deg, #E0F7FA, #B2DFDB);
      border:2px solid color-mix(in srgb, var(--color-safety-green) 25%, transparent);
      box-shadow:0 2px 8px rgba(0,0,0,0.04);
    " in:fly={{ y: 20, delay: 200 }}>
      <div style="position:absolute; top:-20px; right:-20px; font-size:5rem; opacity:0.15; line-height:1;">🎯</div>
      <div style="font-size:2rem; margin-bottom:0.25rem; position:relative;">🎯</div>
      <div style="font-family:var(--font-display); font-weight:800; font-size:2.25rem; color:var(--color-safety-green); line-height:1.2; position:relative;">{missionsDone}<span style="font-size:1.1rem; opacity:0.5;">/5</span></div>
      <div style="font-size:0.8rem; font-weight:600; color:var(--color-earth-brown); opacity:0.7; margin-top:0.15rem;">Misi Selesai</div>
    </div>
  </div>

  <!-- ═══════ XP PROGRESS ═══════ -->
  <div style="
    border-radius:1.25rem;
    padding:1.5rem;
    background:#fff;
    border:2px solid color-mix(in srgb, var(--color-ocean-foam) 40%, transparent);
    box-shadow:0 2px 8px rgba(0,0,0,0.04);
    margin-bottom:2rem;
  " in:fly={{ y: 20, delay: 250 }}>
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.75rem;">
      <div>
        <span style="font-family:var(--font-display); font-weight:700; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--color-safety-orange);">Level {playerLevel}</span>
        <span style="font-size:0.85rem; color:var(--color-earth-brown); margin-left:0.5rem;">{levelTitles[playerLevel] || 'Pemula Tangguh'}</span>
      </div>
      <span style="font-family:var(--font-display); font-weight:700; font-size:0.85rem; color:var(--color-ocean-deep);">{currentXp} / {currentXp + xpNext} XP</span>
    </div>
    <div style="height:0.85rem; border-radius:9999px; background:var(--color-ocean-foam); overflow:hidden;">
      <div style="
        height:100%;
        border-radius:9999px;
        width:{xpBarWidth}%;
        background:linear-gradient(90deg, var(--color-safety-orange), var(--color-safety-yellow));
        box-shadow:0 0 10px rgba(255,107,53,0.35);
        transition:width 0.7s ease-out;
        position:relative;
      ">
        <div style="position:absolute; inset:0; border-radius:9999px; background:linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 60%);"></div>
      </div>
    </div>
  </div>

  <!-- ═══════ MISSION CARDS ═══════ -->
  <div style="margin-bottom:2rem;" in:fly={{ y: 20, delay: 300 }}>
    <div style="text-align:center; margin-bottom:1.25rem;">
      <h2 style="font-family:var(--font-display); font-weight:800; font-size:1.5rem; color:var(--color-ocean-deep); margin:0 0 0.25rem;">📋 Perjalanan Misi</h2>
      <p style="font-size:0.85rem; color:var(--color-earth-brown); opacity:0.65; margin:0;">Selesaikan semua misi untuk menjadi Pahlawan Tangguh Bencana!</p>
    </div>

    <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:0.85rem;">
      {#each levels as level}
        <button
          type="button"
          style="
            position:relative;
            overflow:hidden;
            text-align:center;
            padding:1.25rem 0.75rem;
            border-radius:1.25rem;
            background:#fff;
            font-family:inherit;
            cursor:{level.locked ? 'not-allowed' : 'pointer'};
            opacity:{level.locked ? '0.4' : '1'};
            width:100%;
            border:2px solid {level.done ? 'var(--color-safety-green)' : level.locked ? 'color-mix(in srgb, var(--color-ocean-foam) 30%, transparent)' : 'color-mix(in srgb, var(--color-ocean-foam) 50%, transparent)'};
            box-shadow:0 2px 8px rgba(0,0,0,0.05);
            transition:all 0.25s;
          "
          onclick={level.locked ? undefined : () => goto(`/workshop?quest=${level.num}`)}
          disabled={level.locked}
          onmouseenter={(e) => { if(!level.locked){e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(0,0,0,0.1)';e.currentTarget.style.borderColor='var(--color-safety-yellow)';} }}
          onmouseleave={(e) => { e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)';e.currentTarget.style.borderColor=level.done?'var(--color-safety-green)':level.locked?'color-mix(in srgb, var(--color-ocean-foam) 30%, transparent)':'color-mix(in srgb, var(--color-ocean-foam) 50%, transparent)'; }}
        >
          {#if level.done}
            <div style="position:absolute; top:0.5rem; right:0.5rem; font-size:1.1rem;">✅</div>
          {/if}
          <div style="font-size:2.5rem; margin-bottom:0.5rem; filter:{level.locked ? 'grayscale(100%)' : 'none'};">{level.icon}</div>
          <span style="
            display:inline-block;
            padding:0.2rem 0.7rem;
            border-radius:9999px;
            font-family:var(--font-display);
            font-weight:600;
            font-size:0.65rem;
            margin-bottom:0.4rem;
            background:{level.done ? 'color-mix(in srgb, var(--color-safety-green) 15%, transparent)' : level.locked ? 'color-mix(in srgb, var(--color-ocean-foam) 30%, transparent)' : 'color-mix(in srgb, var(--color-safety-orange) 15%, transparent)'};
            color:{level.done ? 'var(--color-safety-green)' : level.locked ? 'var(--color-earth-brown)' : 'var(--color-safety-orange)'};
          ">Level {level.num}</span>
          <h3 style="font-family:var(--font-display); font-weight:700; font-size:0.85rem; color:var(--color-ocean-deep); margin:0 0 0.25rem;">{level.title}</h3>
          <p style="font-size:0.7rem; color:var(--color-earth-brown); opacity:0.65; margin:0 0 0.5rem; line-height:1.3;">{level.desc}</p>
          <div style="padding-top:0.5rem; border-top:1px solid color-mix(in srgb, var(--color-ocean-foam) 40%, transparent);">
            {#if level.done}
              <span style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; color:var(--color-safety-green);">✨ Selesai</span>
            {:else if level.locked}
              <span style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; color:var(--color-earth-brown); opacity:0.5;">🔒 Terkunci</span>
            {:else}
              <span style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; color:var(--color-safety-orange);">▶️ Mulai</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- ═══════ SIAGA ENCOURAGEMENT ═══════ -->
  <div style="
    border-radius:1.25rem;
    padding:1.25rem 1.5rem;
    display:flex;
    align-items:flex-start;
    gap:1rem;
    background:#fff;
    border:2px solid color-mix(in srgb, var(--color-safety-yellow) 30%, transparent);
    box-shadow:0 2px 8px rgba(0,0,0,0.03);
    margin-bottom:2rem;
  " in:fly={{ y: 20, delay: 400 }}>
    <div style="font-size:2.25rem; flex-shrink:0; line-height:1;">🦉</div>
    <div>
      <p style="font-family:var(--font-display); font-weight:700; font-size:0.8rem; color:var(--color-safety-orange); margin:0 0 0.3rem;">Siaga bilang...</p>
      <p style="font-size:0.9rem; color:var(--color-earth-brown); margin:0; line-height:1.5;">
        {#if missionsDone === 0}
          Ayo mulai perjalananmu! Klik <strong style="color:var(--color-safety-orange);">🧩 Mulai Coding</strong> untuk belajar, atau <strong style="color:var(--color-safety-orange);">🎯 Lihat Misi</strong> untuk tantangan seru!
        {:else if missionsDone < 5}
          Hebat! <strong style="color:var(--color-safety-green);">{missionsDone} misi sudah selesai</strong>. Teruskan semangatmu, Pahlawan Tangguh! 💪
        {:else}
          <strong style="color:var(--color-safety-green);">LUAR BIASA!</strong> Kamu sudah menyelesaikan semua misi! Kamu adalah <strong style="color:var(--color-safety-orange);">Pahlawan Tangguh Bencana</strong> sejati! 🎉🏆
        {/if}
      </p>
    </div>
  </div>

</div>
