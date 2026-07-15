<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="`Rate today (${todayRating}/5)`"
        size="large"
      >
        <v-icon size="22" :color="todayRating > 0 ? 'warning' : undefined">
          {{ todayRating > 0 ? 'mdi-star' : 'mdi-star-outline' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2">How was today?</div>
      <div class="star-row mb-2">
        <button
          v-for="n in 5"
          :key="n"
          class="star-btn"
          :class="{ 'star-btn--filled': todayRating >= n }"
          @click="rateToday(n)"
        >
          <v-icon size="26">
            {{ todayRating >= n ? 'mdi-star' : 'mdi-star-outline' }}
          </v-icon>
        </button>
      </div>

      <div v-if="recentRatings.length" class="rating-list">
        <div class="text-caption text-medium-emphasis mb-1">
          Last {{ recentRatings.length }} days · avg {{ averageRating.toFixed(1) }}
        </div>
        <div v-for="e in recentRatings" :key="e.date" class="rating-row">
          <span class="rating-date">{{ e.date }}</span>
          <span class="rating-stars">
            <v-icon
              v-for="n in 5"
              :key="n"
              size="12"
              :color="e.rating >= n ? 'warning' : undefined"
            >
              {{ e.rating >= n ? 'mdi-star' : 'mdi-star-outline' }}
            </v-icon>
          </span>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { averageRating, rateToday, recentRatings, todayRating } from '../utils/dayRating'
</script>

<style scoped>
.star-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.star-btn {
  border: none;
  background: transparent;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  color: #94A3B8;
  transition: transform 120ms ease;
}

.star-btn:hover {
  transform: scale(1.1);
}

.star-btn--filled {
  color: #F59E0B;
}

.rating-list {
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  padding-top: 8px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
}

.rating-date {
  flex: 1;
  color: #64748B;
}

.rating-stars {
  display: inline-flex;
  gap: 1px;
}
</style>
