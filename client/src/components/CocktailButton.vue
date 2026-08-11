<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Random cocktail"
        size="large"
      >
        <v-icon size="22">mdi-glass-cocktail</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Random Cocktail</div>
      <div class="ck-card">
        <div class="ck-name">{{ pick.name }}</div>
        <div class="ck-glass">{{ pick.glass }}</div>
        <ul class="ck-list">
          <li v-for="(line, i) in pick.recipe" :key="i">{{ line }}</li>
        </ul>
      </div>
      <v-btn block variant="tonal" size="small" class="mt-2" @click="roll">Shake again</v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Cocktail {
  name: string
  glass: string
  recipe: string[]
}

const COCKTAILS: Cocktail[] = [
  { name: 'Old Fashioned',   glass: 'Rocks',    recipe: ['60 ml bourbon', '1 sugar cube', '2 dashes Angostura', 'Orange peel'] },
  { name: 'Negroni',         glass: 'Rocks',    recipe: ['30 ml gin', '30 ml Campari', '30 ml sweet vermouth', 'Orange peel'] },
  { name: 'Margarita',       glass: 'Coupe',    recipe: ['50 ml tequila', '20 ml triple sec', '20 ml lime juice', 'Salt rim'] },
  { name: 'Daiquiri',        glass: 'Coupe',    recipe: ['60 ml white rum', '25 ml lime juice', '15 ml simple syrup'] },
  { name: 'Whiskey Sour',    glass: 'Rocks',    recipe: ['60 ml bourbon', '30 ml lemon juice', '20 ml simple syrup', '½ egg white'] },
  { name: 'Aperol Spritz',   glass: 'Wine',     recipe: ['90 ml prosecco', '60 ml Aperol', 'Splash soda', 'Orange slice'] },
  { name: 'Moscow Mule',     glass: 'Copper mug', recipe: ['50 ml vodka', '15 ml lime juice', 'Ginger beer to top', 'Lime wheel'] },
  { name: 'Espresso Martini', glass: 'Coupe',   recipe: ['50 ml vodka', '30 ml espresso', '20 ml coffee liqueur', '10 ml simple syrup'] },
  { name: 'Cosmopolitan',    glass: 'Coupe',    recipe: ['45 ml vodka', '15 ml triple sec', '15 ml cranberry', '15 ml lime juice'] },
  { name: 'French 75',       glass: 'Flute',    recipe: ['30 ml gin', '15 ml lemon juice', '15 ml simple syrup', 'Champagne to top'] },
  { name: 'Manhattan',       glass: 'Coupe',    recipe: ['60 ml rye whiskey', '30 ml sweet vermouth', '2 dashes Angostura', 'Cherry'] },
  { name: 'Mojito',          glass: 'Highball', recipe: ['50 ml white rum', '25 ml lime juice', '2 tsp sugar', 'Mint leaves', 'Soda to top'] },
]

const pick = ref<Cocktail>(COCKTAILS[0])

function roll() {
  pick.value = COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)]
}

roll()
</script>

<style scoped>
.ck-card {
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #831843, #BE185D);
  color: #FDF2F8;
}

.ck-name {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  text-align: center;
}

.ck-glass {
  margin-top: 2px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  opacity: 0.85;
}

.ck-list {
  margin: 8px 0 0;
  padding-left: 18px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
}

.ck-list li {
  margin-bottom: 2px;
}
</style>
