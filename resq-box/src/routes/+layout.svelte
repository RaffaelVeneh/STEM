<script>
  import { page } from '$app/stores';
  import { fly } from 'svelte/transition';

  let { children } = $props();

  const navItems = [
    { href: '/', label: 'Beranda', icon: '🏠', enLabel: 'Home' },
    { href: '/workshop', label: 'Workshop', icon: '🧩', enLabel: 'Workshop' },
    { href: '/simulator', label: 'Simulator', icon: '🔌', enLabel: 'Simulator' },
    { href: '/quests', label: 'Misi', icon: '🎯', enLabel: 'Quests' },
  ];

  let currentLang = $state('id');
  let activePath = $state('/');

  $effect(() => {
    activePath = $page.url.pathname;
  });

  function getLabel(item) {
    return currentLang === 'id' ? item.label : item.enLabel;
  }
</script>

<div class="flex h-screen">
  <!-- Sidebar -->
  <aside class="w-64 bg-white border-r-2 border-ocean-foam/30 flex flex-col shrink-0">
    <!-- Logo / Brand -->
    <div class="p-6 border-b-2 border-ocean-foam/20">
      <a href="/" class="flex items-center gap-3 no-underline">
        <div class="w-10 h-10 bg-safety-orange rounded-xl flex items-center justify-center text-xl">
          🦉
        </div>
        <div>
          <h1 class="font-display font-bold text-lg text-ocean-deep leading-tight">RESQ-BOX</h1>
          <p class="text-xs text-earth-brown/60">STEM Disaster Kit</p>
        </div>
      </a>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-1">
      {#each navItems as item}
        <a
          href={item.href}
          class="flex items-center gap-3 px-4 py-3 rounded-xl font-display font-medium text-earth-brown
                 hover:bg-safety-yellow/10 hover:text-safety-orange
                 transition-all duration-200 no-underline
                 {activePath === item.href
                   ? 'bg-safety-yellow/10 text-safety-orange border-l-4 border-safety-orange'
                   : 'border-l-4 border-transparent'}"
        >
          <span class="text-xl">{item.icon}</span>
          <span>{getLabel(item)}</span>
        </a>
      {/each}
    </nav>

    <!-- Siaga Mascot Corner -->
    <div class="p-4 border-t-2 border-ocean-foam/20">
      <div class="mascot-bubble text-sm text-earth-brown">
        <p class="font-display font-semibold text-safety-orange">Siaga 🦉</p>
        <p class="text-xs mt-1">Klik misi untuk mulai belajar!</p>
      </div>
    </div>

    <!-- Lang Toggle -->
    <div class="p-4 flex justify-center gap-2 border-t-2 border-ocean-foam/20">
      <button
        class="px-3 py-1 rounded-lg text-xs font-semibold transition-all
               {currentLang === 'id' ? 'bg-safety-orange text-white' : 'bg-ocean-foam/30 text-earth-brown'}"
        onclick={() => currentLang = 'id'}
      >
        🇮🇩 ID
      </button>
      <button
        class="px-3 py-1 rounded-lg text-xs font-semibold transition-all
               {currentLang === 'en' ? 'bg-safety-orange text-white' : 'bg-ocean-foam/30 text-earth-brown'}"
        onclick={() => currentLang = 'en'}
      >
        🇬🇧 EN
      </button>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto bg-gradient-to-br from-siaga-belly to-ocean-foam/20 p-8">
    {@render children()}
  </main>
</div>

<style>
  /* Ensure SvelteKit slot renders correctly in Svelte 5 */
</style>
