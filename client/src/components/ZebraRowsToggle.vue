<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="zebraRows ? 'Disable zebra rows' : 'Enable zebra rows in tables'"
    size="large"
    @click="toggleZebraRows"
  >
    <v-icon size="22" :color="zebraRows ? 'primary' : undefined">
      mdi-table-row
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { toggleZebraRows, zebraRows } from '../utils/zebraRows'
</script>
