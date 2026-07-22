<template>
  <v-app :class="{ 'app--sidebar-collapsed': sidebarCollapsed }">
    <!-- Clean Linear/Vercel-style Sidebar -->
    <div class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
      <!-- Logo Section -->
      <div class="logo-area">
        <div class="logo-mark">SS</div>
        <span class="logo-text">ShiftSync</span>
        <button
          class="sidebar-toggle"
          :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="toggleSidebar"
        >
          <v-icon size="16">
            {{ sidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
          </v-icon>
        </button>
      </div>

      <!-- Navigation Section -->
      <nav class="nav-section">
        <template v-if="pinnedNavItems.length">
          <div class="nav-group-label">Pinned</div>
          <div
            v-for="item in pinnedNavItems"
            :key="`pinned-${item.route}`"
            class="nav-item"
            :class="{ 'nav-item--active': $route.path === item.route }"
            @click="goTo(item.route)"
          >
            <v-icon size="16" class="nav-icon">{{ item.icon }}</v-icon>
            <span class="nav-label">{{ item.title }}</span>
            <button
              class="pin-btn pin-btn--active"
              :title="`Unpin ${item.title}`"
              @click.stop="togglePin(item.route)"
            >
              <v-icon size="14">mdi-pin</v-icon>
            </button>
          </div>
          <div class="nav-group-divider"></div>
        </template>

        <div
          v-for="item in unpinnedNavItems"
          :key="item.route"
          class="nav-item"
          :class="{ 'nav-item--active': $route.path === item.route }"
          @click="goTo(item.route)"
        >
          <v-icon size="16" class="nav-icon">{{ item.icon }}</v-icon>
          <span class="nav-label">{{ item.title }}</span>
          <button
            class="pin-btn"
            :title="`Pin ${item.title}`"
            @click.stop="togglePin(item.route)"
          >
            <v-icon size="14">mdi-pin-outline</v-icon>
          </button>
        </div>
      </nav>

      <!-- Bottom User Card -->
      <div class="user-card">
        <div class="user-avatar">
          {{ getUserInitials(authStore.userName) }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ authStore.userName }}</div>
          <div class="user-role">{{ authStore.userRole }}</div>
        </div>
        <button class="logout-btn" @click="requestLogout" title="Logout">
          <v-icon size="16">mdi-logout</v-icon>
        </button>
      </div>
    </div>

    <!-- Clean Top Bar with Shadow -->
    <v-app-bar
      app
      :color="theme.global.current.value.dark ? 'surface' : 'white'"
      elevation="1"
      height="64"
      class="border-b topbar"
      fixed
    >
      <HistoryNavButtons class="ms-4" />
      <Breadcrumbs />
      <v-spacer />

      <button
        class="cmdk-trigger me-4"
        @click="openPalette"
        title="Quick search (⌘K)"
      >
        <v-icon size="16" class="me-2">mdi-magnify</v-icon>
        <span class="cmdk-text">Search…</span>
        <span class="cmdk-kbd">⌘K</span>
      </button>

      <GreetingChip class="me-4" />

      <TopbarClock class="me-4" />

      <IsoWeekChip class="me-4" />

      <DayOfYearChip class="me-4" />

      <WeekParityChip class="me-4" />

      <NextMondayChip class="me-4" />

      <YearEndCountdownChip class="me-4" />

      <NewYearCountdownChip class="me-4" />

      <NextHourChip class="me-4" />

      <TimeOfDayChip class="me-4" />

      <LocalTimeZoneChip class="me-4" />

      <WorldClockChip class="me-4" />

      <UtcClockChip class="me-4" />

      <UtcOffsetChip class="me-4" />

      <AppVersionChip class="me-4" />

      <ViewportSizeChip class="me-4" />

      <CpuCoresChip class="me-4" />

      <LocaleChip class="me-4" />

      <WeekendChip class="me-4" />

      <MoonPhaseChip class="me-4" />

      <BatteryChip class="me-4" />

      <SessionUptimeChip class="me-4" />

      <NotificationCounterChip class="me-4" />

      <PingLatencyChip class="me-4" />

      <IdleTimeChip class="me-4" />

      <MouseCoordChip class="me-4" />

      <CompassChip class="me-4" />

      <EnvironmentChip class="me-4" />

      <LunchCountdownChip class="me-4" />

      <EodCountdownChip class="me-4" />

      <WeekendCountdownChip class="me-4" />

      <v-chip
        v-if="authStore.userName"
        class="me-4"
        color="primary"
        variant="outlined"
        size="small"
      >
        <v-icon start size="small">mdi-account</v-icon>
        {{ authStore.userName }}
      </v-chip>

      <div
        v-if="authStore.userRole"
        class="role-badge me-4"
        :class="`role-${authStore.userRole.toLowerCase()}`"
      >
        {{ authStore.userRole }}
      </div>

      <CopyLinkButton />

      <CopyDebugInfoButton />

      <SpeedTestButton />

      <CopyUserEmailButton />

      <InstallAppButton />

      <CopyTimeButton />

      <PrintPageButton />

      <JumpToTodayButton />

      <PageTitleMenu />

      <DoNotDisturbToggle />

      <NotificationSnoozeMenu />

      <AutoRefreshMenu />

      <PomodoroButton />

      <BreathTimerButton />

      <WhiteNoiseButton />

      <BookmarksButton />

      <CountdownTimerButton />

      <AlarmButton />

      <MeetingCostButton />

      <ChessClockButton />

      <CustomCountdownButton />

      <StopwatchButton />

      <BpmTapperButton />

      <MetronomeButton />

      <VibrateButton />

      <VoiceRecorderButton />

      <StickyNoteButton />

      <DoodlePadButton />

      <ConfettiButton />

      <QuickCalcButton />

      <UnitConverterButton />

      <CurrencyConvertButton />

      <Base64Button />

      <CaesarCipherButton />

      <AesCipherButton />

      <MorseCodeButton />

      <LeetspeakButton />

      <FlipTextButton />

      <ZalgoTextButton />

      <TextTruncateButton />

      <BigTextButton />

      <NatoPhoneticButton />

      <BinaryTextButton />

      <TextStatsButton />

      <WordFrequencyButton />

      <SortLinesButton />

      <DedupeLinesButton />

      <UnicodeLookupButton />

      <JsonFormatterButton />

      <UrlEncoderButton />

      <JwtDecoderButton />

      <UuidButton />

      <FakeNameButton />

      <TextDiffButton />

      <MarkdownPreviewButton />

      <MarkdownTableButton />

      <BionicReaderButton />

      <QuoteButton />

      <HashButton />

      <RegexTesterButton />

      <RegexEscapeButton />

      <SlugifyButton />

      <CaseConverterButton />

      <LoremIpsumButton />

      <NumberBaseButton />

      <ExcelColumnButton />

      <TimestampConverterButton />

      <TimezoneDiffButton />

      <TimeFormatButton />

      <HtmlEntitiesButton />

      <HttpStatusButton />

      <VimCheatButton />

      <GitCheatButton />

      <UserAgentButton />

      <RomanNumeralsButton />

      <NumberWordsButton />

      <NumberFormatButton />

      <TextReverserButton />

      <AnagramButton />

      <GradientGenButton />

      <BoxShadowGenButton />

      <BorderRadiusGenButton />

      <CssFilterGenButton />

      <CssAnimationButton />

      <CsvViewerButton />

      <CsvToJsonButton />

      <JsonToCsvButton />

      <TextToSpeechButton />

      <SpeechToTextButton />

      <LocalStorageViewerButton />

      <QuickTodoButton />

      <DayRatingButton />

      <HabitTrackerButton />

      <CronPreviewButton />

      <AgeCalculatorButton />

      <DateDiffButton />

      <TipCalcButton />

      <BmiCalcButton />

      <PercentCalcButton />

      <DistanceCalcButton />

      <TrigCalcButton />

      <AspectRatioButton />

      <DmsConverterButton />

      <MapsUrlButton />

      <EmojiPickerButton />

      <PasswordGenButton />

      <PasswordStrengthButton />

      <ColorPickerButton />

      <NamedColorButton />

      <RandomColorButton />

      <DiceRollButton />

      <CoinFlipButton />

      <YesNoButton />

      <RandomNumberButton />

      <MemoryGameButton />

      <ReactionGameButton />

      <RpsButton />

      <TicTacToeButton />

      <WordScrambleButton />

      <RandomPickerButton />

      <SidebarWidthMenu />

      <HighContrastToggle />

      <UnderlineLinksToggle />

      <CursorSizeMenu />

      <SepiaModeToggle />

      <ScreenDimmer />

      <GridOverlayToggle />

      <RulerOverlayToggle />

      <MatrixRainToggle />

      <PrivacyBlurToggle />

      <SnowfallToggle />

      <GrayscaleModeToggle />

      <InvertColorsToggle />

      <LineHeightMenu />

      <LetterSpacingToggle />

      <UppercaseModeToggle />

      <ClockSecondsToggle />

      <FeedbackButton />

      <TextZoomMenu />

      <FontFamilyMenu />

      <RtlModeToggle />

      <ZebraRowsToggle />

      <FocusModeToggle />

      <FullscreenToggle />

      <WakeLockToggle />

      <ReducedMotionMenu />

      <v-btn
        icon
        @click="openWhatsNew"
        variant="text"
        class="me-2"
        title="What's new"
        size="large"
      >
        <v-icon size="22">mdi-gift-outline</v-icon>
      </v-btn>

      <v-btn
        icon
        @click="openShortcuts"
        variant="text"
        class="me-2"
        title="Keyboard shortcuts (?)"
        size="large"
      >
        <v-icon size="22">mdi-keyboard-outline</v-icon>
      </v-btn>

      <AutoThemeMenu />

      <v-btn
        icon
        @click="toggleTheme"
        variant="text"
        class="me-2"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        size="large"
      >
        <v-icon size="22">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <v-btn
        icon
        @click="requestLogout"
        variant="text"
        class="logout-topbar-btn"
        title="Logout"
        color="error"
        size="large"
      >
        <v-icon size="24">mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <AnnouncementBanner />
        <router-view />
      </v-container>
    </v-main>

    <CommandPalette />
    <ShortcutsModal ref="shortcutsRef" />
    <ScrollProgressBar />
    <ScrollToTopButton />
    <WhatsNewModal ref="whatsNewRef" />
    <IdleTimeoutModal />
    <LogoutConfirmDialog ref="logoutDialogRef" @confirm="handleLogout" />
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import CommandPalette from '../components/CommandPalette.vue'
import ShortcutsModal from '../components/ShortcutsModal.vue'
import ScrollToTopButton from '../components/ScrollToTopButton.vue'
import ScrollProgressBar from '../components/ScrollProgressBar.vue'
import WhatsNewModal from '../components/WhatsNewModal.vue'
import IdleTimeoutModal from '../components/IdleTimeoutModal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import LogoutConfirmDialog from '../components/LogoutConfirmDialog.vue'
import TopbarClock from '../components/TopbarClock.vue'
import IsoWeekChip from '../components/IsoWeekChip.vue'
import DayOfYearChip from '../components/DayOfYearChip.vue'
import WeekParityChip from '../components/WeekParityChip.vue'
import NextMondayChip from '../components/NextMondayChip.vue'
import YearEndCountdownChip from '../components/YearEndCountdownChip.vue'
import NewYearCountdownChip from '../components/NewYearCountdownChip.vue'
import NextHourChip from '../components/NextHourChip.vue'
import TimeOfDayChip from '../components/TimeOfDayChip.vue'
import TextZoomMenu from '../components/TextZoomMenu.vue'
import FocusModeToggle from '../components/FocusModeToggle.vue'
import HistoryNavButtons from '../components/HistoryNavButtons.vue'
import ReducedMotionMenu from '../components/ReducedMotionMenu.vue'
import CopyLinkButton from '../components/CopyLinkButton.vue'
import CopyDebugInfoButton from '../components/CopyDebugInfoButton.vue'
import SpeedTestButton from '../components/SpeedTestButton.vue'
import CopyUserEmailButton from '../components/CopyUserEmailButton.vue'
import InstallAppButton from '../components/InstallAppButton.vue'
import CopyTimeButton from '../components/CopyTimeButton.vue'
import PrintPageButton from '../components/PrintPageButton.vue'
import AutoThemeMenu from '../components/AutoThemeMenu.vue'
import AnnouncementBanner from '../components/AnnouncementBanner.vue'
import LocalTimeZoneChip from '../components/LocalTimeZoneChip.vue'
import SessionUptimeChip from '../components/SessionUptimeChip.vue'
import NotificationCounterChip from '../components/NotificationCounterChip.vue'
import PingLatencyChip from '../components/PingLatencyChip.vue'
import IdleTimeChip from '../components/IdleTimeChip.vue'
import MouseCoordChip from '../components/MouseCoordChip.vue'
import CompassChip from '../components/CompassChip.vue'
import EnvironmentChip from '../components/EnvironmentChip.vue'
import LunchCountdownChip from '../components/LunchCountdownChip.vue'
import EodCountdownChip from '../components/EodCountdownChip.vue'
import WeekendCountdownChip from '../components/WeekendCountdownChip.vue'
import JumpToTodayButton from '../components/JumpToTodayButton.vue'
import PageTitleMenu from '../components/PageTitleMenu.vue'
import DoNotDisturbToggle from '../components/DoNotDisturbToggle.vue'
import NotificationSnoozeMenu from '../components/NotificationSnoozeMenu.vue'
import AutoRefreshMenu from '../components/AutoRefreshMenu.vue'
import PomodoroButton from '../components/PomodoroButton.vue'
import BreathTimerButton from '../components/BreathTimerButton.vue'
import WhiteNoiseButton from '../components/WhiteNoiseButton.vue'
import BookmarksButton from '../components/BookmarksButton.vue'
import CountdownTimerButton from '../components/CountdownTimerButton.vue'
import AlarmButton from '../components/AlarmButton.vue'
import MeetingCostButton from '../components/MeetingCostButton.vue'
import ChessClockButton from '../components/ChessClockButton.vue'
import CustomCountdownButton from '../components/CustomCountdownButton.vue'
import StopwatchButton from '../components/StopwatchButton.vue'
import BpmTapperButton from '../components/BpmTapperButton.vue'
import MetronomeButton from '../components/MetronomeButton.vue'
import VibrateButton from '../components/VibrateButton.vue'
import VoiceRecorderButton from '../components/VoiceRecorderButton.vue'
import StickyNoteButton from '../components/StickyNoteButton.vue'
import DoodlePadButton from '../components/DoodlePadButton.vue'
import ConfettiButton from '../components/ConfettiButton.vue'
import QuickCalcButton from '../components/QuickCalcButton.vue'
import UnitConverterButton from '../components/UnitConverterButton.vue'
import CurrencyConvertButton from '../components/CurrencyConvertButton.vue'
import Base64Button from '../components/Base64Button.vue'
import CaesarCipherButton from '../components/CaesarCipherButton.vue'
import AesCipherButton from '../components/AesCipherButton.vue'
import MorseCodeButton from '../components/MorseCodeButton.vue'
import LeetspeakButton from '../components/LeetspeakButton.vue'
import FlipTextButton from '../components/FlipTextButton.vue'
import ZalgoTextButton from '../components/ZalgoTextButton.vue'
import TextTruncateButton from '../components/TextTruncateButton.vue'
import BigTextButton from '../components/BigTextButton.vue'
import NatoPhoneticButton from '../components/NatoPhoneticButton.vue'
import BinaryTextButton from '../components/BinaryTextButton.vue'
import TextStatsButton from '../components/TextStatsButton.vue'
import WordFrequencyButton from '../components/WordFrequencyButton.vue'
import SortLinesButton from '../components/SortLinesButton.vue'
import DedupeLinesButton from '../components/DedupeLinesButton.vue'
import UnicodeLookupButton from '../components/UnicodeLookupButton.vue'
import JsonFormatterButton from '../components/JsonFormatterButton.vue'
import UrlEncoderButton from '../components/UrlEncoderButton.vue'
import JwtDecoderButton from '../components/JwtDecoderButton.vue'
import UuidButton from '../components/UuidButton.vue'
import FakeNameButton from '../components/FakeNameButton.vue'
import TextDiffButton from '../components/TextDiffButton.vue'
import MarkdownPreviewButton from '../components/MarkdownPreviewButton.vue'
import MarkdownTableButton from '../components/MarkdownTableButton.vue'
import BionicReaderButton from '../components/BionicReaderButton.vue'
import QuoteButton from '../components/QuoteButton.vue'
import HashButton from '../components/HashButton.vue'
import RegexTesterButton from '../components/RegexTesterButton.vue'
import RegexEscapeButton from '../components/RegexEscapeButton.vue'
import SlugifyButton from '../components/SlugifyButton.vue'
import CaseConverterButton from '../components/CaseConverterButton.vue'
import LoremIpsumButton from '../components/LoremIpsumButton.vue'
import NumberBaseButton from '../components/NumberBaseButton.vue'
import ExcelColumnButton from '../components/ExcelColumnButton.vue'
import TimestampConverterButton from '../components/TimestampConverterButton.vue'
import TimezoneDiffButton from '../components/TimezoneDiffButton.vue'
import TimeFormatButton from '../components/TimeFormatButton.vue'
import HtmlEntitiesButton from '../components/HtmlEntitiesButton.vue'
import HttpStatusButton from '../components/HttpStatusButton.vue'
import VimCheatButton from '../components/VimCheatButton.vue'
import GitCheatButton from '../components/GitCheatButton.vue'
import UserAgentButton from '../components/UserAgentButton.vue'
import RomanNumeralsButton from '../components/RomanNumeralsButton.vue'
import NumberWordsButton from '../components/NumberWordsButton.vue'
import NumberFormatButton from '../components/NumberFormatButton.vue'
import TextReverserButton from '../components/TextReverserButton.vue'
import AnagramButton from '../components/AnagramButton.vue'
import GradientGenButton from '../components/GradientGenButton.vue'
import BoxShadowGenButton from '../components/BoxShadowGenButton.vue'
import BorderRadiusGenButton from '../components/BorderRadiusGenButton.vue'
import CssFilterGenButton from '../components/CssFilterGenButton.vue'
import CssAnimationButton from '../components/CssAnimationButton.vue'
import CsvViewerButton from '../components/CsvViewerButton.vue'
import CsvToJsonButton from '../components/CsvToJsonButton.vue'
import JsonToCsvButton from '../components/JsonToCsvButton.vue'
import TextToSpeechButton from '../components/TextToSpeechButton.vue'
import SpeechToTextButton from '../components/SpeechToTextButton.vue'
import LocalStorageViewerButton from '../components/LocalStorageViewerButton.vue'
import QuickTodoButton from '../components/QuickTodoButton.vue'
import DayRatingButton from '../components/DayRatingButton.vue'
import HabitTrackerButton from '../components/HabitTrackerButton.vue'
import CronPreviewButton from '../components/CronPreviewButton.vue'
import AgeCalculatorButton from '../components/AgeCalculatorButton.vue'
import DateDiffButton from '../components/DateDiffButton.vue'
import TipCalcButton from '../components/TipCalcButton.vue'
import BmiCalcButton from '../components/BmiCalcButton.vue'
import PercentCalcButton from '../components/PercentCalcButton.vue'
import DistanceCalcButton from '../components/DistanceCalcButton.vue'
import TrigCalcButton from '../components/TrigCalcButton.vue'
import AspectRatioButton from '../components/AspectRatioButton.vue'
import DmsConverterButton from '../components/DmsConverterButton.vue'
import MapsUrlButton from '../components/MapsUrlButton.vue'
import EmojiPickerButton from '../components/EmojiPickerButton.vue'
import PasswordGenButton from '../components/PasswordGenButton.vue'
import PasswordStrengthButton from '../components/PasswordStrengthButton.vue'
import ColorPickerButton from '../components/ColorPickerButton.vue'
import NamedColorButton from '../components/NamedColorButton.vue'
import RandomColorButton from '../components/RandomColorButton.vue'
import DiceRollButton from '../components/DiceRollButton.vue'
import CoinFlipButton from '../components/CoinFlipButton.vue'
import YesNoButton from '../components/YesNoButton.vue'
import RandomNumberButton from '../components/RandomNumberButton.vue'
import MemoryGameButton from '../components/MemoryGameButton.vue'
import ReactionGameButton from '../components/ReactionGameButton.vue'
import RpsButton from '../components/RpsButton.vue'
import TicTacToeButton from '../components/TicTacToeButton.vue'
import WordScrambleButton from '../components/WordScrambleButton.vue'
import RandomPickerButton from '../components/RandomPickerButton.vue'
import UnderlineLinksToggle from '../components/UnderlineLinksToggle.vue'
import CursorSizeMenu from '../components/CursorSizeMenu.vue'
import SepiaModeToggle from '../components/SepiaModeToggle.vue'
import ScreenDimmer from '../components/ScreenDimmer.vue'
import GridOverlayToggle from '../components/GridOverlayToggle.vue'
import RulerOverlayToggle from '../components/RulerOverlayToggle.vue'
import MatrixRainToggle from '../components/MatrixRainToggle.vue'
import PrivacyBlurToggle from '../components/PrivacyBlurToggle.vue'
import SnowfallToggle from '../components/SnowfallToggle.vue'
import GrayscaleModeToggle from '../components/GrayscaleModeToggle.vue'
import InvertColorsToggle from '../components/InvertColorsToggle.vue'
import LineHeightMenu from '../components/LineHeightMenu.vue'
import LetterSpacingToggle from '../components/LetterSpacingToggle.vue'
import UppercaseModeToggle from '../components/UppercaseModeToggle.vue'
import FontFamilyMenu from '../components/FontFamilyMenu.vue'
import RtlModeToggle from '../components/RtlModeToggle.vue'
import ZebraRowsToggle from '../components/ZebraRowsToggle.vue'
import FullscreenToggle from '../components/FullscreenToggle.vue'
import WakeLockToggle from '../components/WakeLockToggle.vue'
import SidebarWidthMenu from '../components/SidebarWidthMenu.vue'
import '../utils/sidebarWidth'
import GreetingChip from '../components/GreetingChip.vue'
import HighContrastToggle from '../components/HighContrastToggle.vue'
import WorldClockChip from '../components/WorldClockChip.vue'
import UtcClockChip from '../components/UtcClockChip.vue'
import UtcOffsetChip from '../components/UtcOffsetChip.vue'
import AppVersionChip from '../components/AppVersionChip.vue'
import ViewportSizeChip from '../components/ViewportSizeChip.vue'
import CpuCoresChip from '../components/CpuCoresChip.vue'
import LocaleChip from '../components/LocaleChip.vue'
import WeekendChip from '../components/WeekendChip.vue'
import BatteryChip from '../components/BatteryChip.vue'
import MoonPhaseChip from '../components/MoonPhaseChip.vue'
import ClockSecondsToggle from '../components/ClockSecondsToggle.vue'
import FeedbackButton from '../components/FeedbackButton.vue'
import { pinnedRoutes, togglePinned } from '../utils/pinnedNav'
import { sidebarCollapsed, toggleSidebar } from '../utils/sidebar'

const authStore = useAuthStore()
const router = useRouter()
const theme = useTheme()
const shortcutsRef = ref<InstanceType<typeof ShortcutsModal> | null>(null)
const whatsNewRef = ref<InstanceType<typeof WhatsNewModal> | null>(null)
const logoutDialogRef = ref<InstanceType<typeof LogoutConfirmDialog> | null>(null)

function openPalette() {
  const evt = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
  window.dispatchEvent(evt)
}

function openShortcuts() {
  if (shortcutsRef.value) {
    shortcutsRef.value.open = true
  }
}

function openWhatsNew() {
  whatsNewRef.value?.open()
}

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  const next = isDark.value ? 'light' : 'dark'
  theme.global.name.value = next
  localStorage.setItem('theme', next)
}


const navItems = [
  { title: 'Dashboard', route: '/dashboard', icon: 'mdi-view-dashboard', roles: ['admin', 'manager'] },
  { title: 'Shifts', route: '/shifts', icon: 'mdi-calendar-clock', roles: ['admin', 'manager'] },
  { title: 'Schedule', route: '/schedule', icon: 'mdi-calendar', roles: ['admin', 'manager', 'staff'] },
  { title: 'Swap Requests', route: '/swap-requests', icon: 'mdi-swap-horizontal', roles: ['admin', 'manager', 'staff'] },
  { title: 'Notifications', route: '/notifications', icon: 'mdi-bell', roles: ['admin', 'manager', 'staff'] },
  { title: 'Analytics', route: '/analytics', icon: 'mdi-chart-bar', roles: ['admin', 'manager'] },
  { title: 'Reports', route: '/reports', icon: 'mdi-file-export', roles: ['admin', 'manager'] },
  { title: 'Settings', route: '/settings', icon: 'mdi-cog', roles: ['admin', 'manager', 'staff'] },
  { title: 'Profile', route: '/profile', icon: 'mdi-account-circle', roles: ['admin', 'manager', 'staff'] },
  { title: 'Help', route: '/help', icon: 'mdi-help-circle-outline', roles: ['admin', 'manager', 'staff'] },
]

const filteredNavItems = computed(() => {
  if (!authStore.userRole) return []
  const userRole = authStore.userRole.toLowerCase()
  return navItems.filter(item => item.roles.includes(userRole))
})

const pinnedNavItems = computed(() =>
  pinnedRoutes.value
    .map(route => filteredNavItems.value.find(i => i.route === route))
    .filter((i): i is typeof navItems[number] => Boolean(i))
)

const unpinnedNavItems = computed(() =>
  filteredNavItems.value.filter(i => !pinnedRoutes.value.includes(i.route))
)

function togglePin(route: string) {
  togglePinned(route)
}

function goTo(route: string) {
  if (router.currentRoute.value.path !== route) {
    router.push(route)
  }
}

function _getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin': return 'error'
    case 'manager': return 'warning'
    case 'staff': return 'info'
    default: return 'primary'
  }
}

function getUserInitials(name: string | null): string {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function requestLogout() {
  logoutDialogRef.value?.show()
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped>
/* Sidebar Container - Linear/Vercel Style */
.sidebar {
  width: var(--app-sidebar-width, 220px);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  flex-direction: column;
  padding: 0;
  z-index: 1000;
}

/* Logo Area */
.logo-area {
  height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #2563EB;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

/* Navigation Section */
.nav-section {
  padding: 16px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Group label above pinned items */
.nav-group-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  padding: 4px 10px 2px;
}

.nav-group-divider {
  height: 1px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  margin: 8px 4px;
}

/* Nav Items */
.nav-item {
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
  text-decoration: none;
  position: relative;
}

.nav-label {
  flex: 1;
}

.pin-btn {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 120ms ease, background 120ms ease;
  flex-shrink: 0;
}

.pin-btn .v-icon {
  color: #94A3B8 !important;
}

.nav-item:hover .pin-btn,
.pin-btn--active {
  opacity: 1;
}

.pin-btn--active .v-icon {
  color: #2563EB !important;
}

.pin-btn:hover {
  background: rgba(148, 163, 184, 0.15);
}

/* Default State */
.nav-icon {
  color: #94A3B8 !important;
  flex-shrink: 0;
}

.nav-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
}

/* Hover State */
.nav-item:hover:not(.nav-item--active) {
  background: #F9FAFB;
}

.nav-item:hover:not(.nav-item--active) .nav-icon {
  color: #475569 !important;
}

.nav-item:hover:not(.nav-item--active) .nav-label {
  color: #374151;
}

/* Active State */
.nav-item--active {
  background: #EFF6FF;
  font-weight: 600;
}

.nav-item--active .nav-icon {
  color: #2563EB !important;
}

.nav-item--active .nav-label {
  color: #1D4ED8;
  font-weight: 600;
}

/* Bottom User Card */
.user-card {
  padding: 12px 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0F172A;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

.logout-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 120ms ease;
}

.logout-btn .v-icon {
  color: #CBD5E1 !important;
}

.logout-btn:hover {
  background: #FEF2F2;
}

.logout-btn:hover .v-icon {
  color: #EF4444 !important;
}

/* Adjust main content to accommodate fixed sidebar and topbar */
.v-main {
  margin-left: var(--app-sidebar-width, 220px) !important;
  padding-top: 64px !important;
}


/* App bar border and fixed positioning */
.border-b {
  border-bottom: 1px solid #F0F0F0 !important;
}

.topbar {
  position: fixed !important;
  top: 0 !important;
  left: var(--app-sidebar-width, 220px) !important;
  width: calc(100% - var(--app-sidebar-width, 220px)) !important;
  z-index: 999 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

/* Logout button styling */
.logout-topbar-btn {
  border: 1px solid #e0e0e0 !important;
  background: white !important;
}

.logout-topbar-btn:hover {
  background: #f5f5f5 !important;
  border-color: #d0d0d0 !important;
}

/* Role Badge */
.role-badge {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 6px;
  padding: 3px 10px;
  display: inline-flex;
  align-items: center;
}

.role-admin {
  background: #EFF6FF;
  color: #2563EB;
}

/* Command palette trigger in topbar */
.cmdk-trigger {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: transparent;
  color: #94A3B8;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
  min-width: 180px;
}

.cmdk-trigger:hover {
  background: rgba(148, 163, 184, 0.08);
  border-color: rgba(148, 163, 184, 0.5);
}

.cmdk-text {
  flex: 1;
  text-align: left;
}

.cmdk-kbd {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  padding: 2px 6px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  color: #94A3B8;
}

/* Sidebar collapse toggle */
.sidebar-toggle {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94A3B8;
  transition: background 120ms ease, color 120ms ease;
}

.sidebar-toggle:hover {
  background: rgba(148, 163, 184, 0.12);
  color: #1D4ED8;
}

/* Collapsed sidebar — narrow rail with icons only */
.sidebar {
  transition: width 180ms ease;
}

.sidebar--collapsed {
  width: 64px;
}

.sidebar--collapsed .logo-area {
  padding: 0 12px;
  justify-content: center;
}

.sidebar--collapsed .logo-text,
.sidebar--collapsed .nav-label,
.sidebar--collapsed .nav-group-label,
.sidebar--collapsed .user-info,
.sidebar--collapsed .pin-btn {
  display: none;
}

.sidebar--collapsed .sidebar-toggle {
  margin: 0;
}

.sidebar--collapsed .nav-section {
  padding: 12px 8px;
  align-items: center;
}

.sidebar--collapsed .nav-item {
  justify-content: center;
  padding: 0;
  width: 40px;
}

.sidebar--collapsed .user-card {
  justify-content: center;
  padding: 12px 8px;
}

.app--sidebar-collapsed .v-main {
  margin-left: 64px !important;
}

.app--sidebar-collapsed .topbar {
  left: 64px !important;
  width: calc(100% - 64px) !important;
}
</style>