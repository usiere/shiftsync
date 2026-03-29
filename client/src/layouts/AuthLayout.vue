<template>
  <v-app>
    <v-main>
      <v-container
        fluid
        class="fill-height"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      >
        <v-row
          justify="center"
          align="center"
          class="fill-height"
        >
          <v-col
            cols="12"
            sm="8"
            md="6"
            lg="4"
            xl="3"
          >
            <v-card
              class="elevation-12"
              rounded="lg"
            >
              <v-card-item class="text-center pa-6">
                <div class="mb-4">
                  <v-icon
                    size="48"
                    color="primary"
                  >
                    mdi-calendar-clock
                  </v-icon>
                </div>
                <v-card-title class="text-h4 font-weight-bold">
                  ShiftSync
                </v-card-title>
                <v-card-subtitle class="text-subtitle-1">
                  Employee Scheduling Management
                </v-card-subtitle>
              </v-card-item>

              <v-card-text class="pa-6">
                <router-view />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// No additional setup needed for this layout
</script>

<style scoped>
.v-card {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95) !important;
}
</style>