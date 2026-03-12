import apiFetch from "@/lib/apiFetch";
import {
  Badge,
  Box,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/id";
import duration from "dayjs/plugin/duration";
import { useEffect, useMemo, useState } from "react";

import {
  IconBell,
  IconCalendarEvent,
  IconCalendarStar,
  IconChevronRight,
  IconClock,
  IconClockHour4,
  IconGift,
  IconMoon,
  IconStar,
  IconStarFilled,
  IconSun,
  IconSunHigh,
  IconSunrise,
  IconSunset,
  IconUsers,
  IconUserStar,
} from "@tabler/icons-react";

import DateHolidays, { type HolidaysTypes } from "date-holidays";
import useSwr from "swr";
import { useNavigate } from "react-router";
import clientRoutes from "@/clientRoutes";
dayjs.locale("id");
dayjs.extend(duration);

// ====== GLASSMORPHISM STYLES ======
const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 24,
  overflow: "hidden",
};

const glassSubtle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: 18,
};

const glassInner: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.04)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: 14,
};

const prayerNames: Record<string, string> = {
  fajr: "Subuh",
  sunrise: "Syuruq",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Maghrib",
  isha: "Isya",
};

const prayerIcons: Record<string, any> = {
  fajr: IconSunrise,
  sunrise: IconSun,
  dhuhr: IconSunHigh,
  asr: IconSun,
  maghrib: IconSunset,
  isha: IconMoon,
};

const prayerGlows: Record<string, { bg: string; glow: string; accent: string }> = {
  fajr: {
    bg: "rgba(56, 189, 248, 0.08)",
    glow: "0 0 40px rgba(56, 189, 248, 0.15)",
    accent: "#38bdf8",
  },
  sunrise: {
    bg: "rgba(251, 191, 36, 0.08)",
    glow: "0 0 40px rgba(251, 191, 36, 0.15)",
    accent: "#fbbf24",
  },
  dhuhr: {
    bg: "rgba(250, 204, 21, 0.08)",
    glow: "0 0 40px rgba(250, 204, 21, 0.12)",
    accent: "#facc15",
  },
  asr: {
    bg: "rgba(251, 146, 60, 0.08)",
    glow: "0 0 40px rgba(251, 146, 60, 0.12)",
    accent: "#fb923c",
  },
  maghrib: {
    bg: "rgba(244, 63, 94, 0.08)",
    glow: "0 0 40px rgba(244, 63, 94, 0.15)",
    accent: "#f43f5e",
  },
  isha: {
    bg: "rgba(139, 92, 246, 0.08)",
    glow: "0 0 40px rgba(139, 92, 246, 0.15)",
    accent: "#8b5cf6",
  },
};

export function formatCountdown(dt: dayjs.Dayjs | null) {
  if (!dt) return "-";
  const now = dayjs();
  const diff = dt.diff(now);
  if (diff <= 0) return "Sudah lewat";
  const dur = dayjs.duration(diff);
  return `${dur.hours()}j ${dur.minutes()}m`;
}

export default function AdhanPage() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [monthly, setMonthly] = useState<any>(null);
  const [daily, setDaily] = useState<any>(null);
  const [adhan, setAdhan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const year = dayjs(date).year();
  const month = dayjs(date).month() + 1;
  const selectedDateStr = dayjs(date).format("YYYY-MM-DD");

  const fetchAll = async () => {
    setLoading(true);
    const bulan = await apiFetch.api["jadwal-sholat"].bulanan.get({
      query: { day: dayjs(date).date(), month, year },
    });
    const hari = await apiFetch.api["jadwal-sholat"].hari.get({
      query: { date: selectedDateStr, holidays: [] },
    });
    const ad = await apiFetch.api["jadwal-sholat"].adhan.get({
      query: { date: selectedDateStr, latitude: -8.65, longitude: 115.2167 },
    });
    setMonthly(bulan.data);
    setDaily(hari.data);
    setAdhan(ad.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [date]);

  const holidays = useMemo(() => {
    const hd = new DateHolidays("ID");
    return hd.getHolidays(year) || [];
  }, [year]);

  const isHoliday = (d: string) =>
    holidays.some(
      (h) => dayjs(h.date).format("YYYY-MM-DD") === dayjs(d).format("YYYY-MM-DD"),
    );

  const monthGrid = useMemo(() => {
    const first = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
    const daysInMonth = first.daysInMonth();
    const startWeekday = first.day();
    const cells: Array<{ date: dayjs.Dayjs | null }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({
        date: dayjs(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`),
      });
    while (cells.length % 7 !== 0) cells.push({ date: null });
    return { cells, daysInMonth, startWeekday };
  }, [year, month]);

  const prayerList = useMemo(() => {
    if (!adhan || !adhan.adhan) return [];
    return Object.entries(adhan.adhan).map(([key, timeStr]) => {
      const dt = dayjs(`${selectedDateStr} ${timeStr}`, "YYYY-MM-DD HH:mm");
      const diffMs = dt.diff(dayjs());
      const isPast = diffMs <= 0;
      return {
        key,
        label: prayerNames[key] || key,
        time: timeStr as string,
        dt,
        isPast,
        Icon: prayerIcons[key] ?? IconClock,
      };
    });
  }, [adhan, selectedDateStr]);

  const nextPrayer = prayerList.find((p) => !p.isPast);

  const fmtCountdown = (dt: dayjs.Dayjs) => {
    const diff = dt.diff(dayjs());
    if (diff <= 0) return "Sudah lewat";
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}j ${mins}m`;
    return `${mins}m`;
  };

  if (!monthly || !daily || !adhan) {
    return (
      <Container size="md" w="100%">
        <Stack gap="xl" py="xl">
          <Skeleton height={20} radius="sm" />
          <Skeleton height={200} radius="md" />
          <Skeleton height={300} radius="md" />
        </Stack>
      </Container>
    );
  }

  return (
    <Box
      w="100%"
      mih="100vh"
      py="lg"
      style={{
        background: "radial-gradient(ellipse at 20% 0%, rgba(20, 184, 166, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139, 92, 246, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.04) 0%, transparent 60%), #050508",
      }}
    >
      <Container size="md" w="100%" px="md">
        <Stack gap="md">

          {/* ===== HERO: IMAM HARI INI ===== */}
          <Card
            padding="xl"
            style={{
              ...glass,
              background: "rgba(20, 184, 166, 0.05)",
              boxShadow: "0 8px 40px rgba(0, 0, 0, 0.3), 0 0 80px rgba(20, 184, 166, 0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <Stack align="center" gap="md">
              <Text size="sm" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 2 }}>
                Imam Shalat Hari Ini
              </Text>

              <Box
                style={{
                  padding: 18,
                  borderRadius: "50%",
                  background: "rgba(20, 184, 166, 0.12)",
                  border: "1px solid rgba(20, 184, 166, 0.2)",
                  boxShadow: "0 0 40px rgba(20, 184, 166, 0.2), 0 0 80px rgba(20, 184, 166, 0.08)",
                }}
              >
                <IconUserStar size={44} color="#14b8a6" stroke={1.5} />
              </Box>

              <Title order={1} fw={800} ta="center" c="white"
                style={{ textShadow: "0 0 30px rgba(20, 184, 166, 0.25)", fontSize: "2rem" }}
              >
                {daily.data.imam || "-"}
              </Title>

              <Badge
                size="lg"
                variant="light"
                color="cyan"
                radius="xl"
                style={{
                  backdropFilter: "blur(8px)",
                  background: "rgba(0, 200, 255, 0.1)",
                  border: "1px solid rgba(0, 200, 255, 0.15)",
                }}
              >
                {dayjs(date).locale("id").format("dddd, DD MMMM YYYY")}
              </Badge>

              {/* Iqomah info */}
              <Paper
                p="md"
                style={{
                  ...glassInner,
                  background: "rgba(100, 149, 237, 0.08)",
                  width: "100%",
                  maxWidth: 280,
                }}
              >
                <Group justify="center" gap="sm">
                  <IconClockHour4 size={22} color="#6495ed"
                    style={{ filter: "drop-shadow(0 0 6px rgba(100,149,237,0.5))" }}
                  />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">Iqomah</Text>
                    <Text size="xl" fw={800} c="blue.3"
                      style={{ textShadow: "0 0 15px rgba(100,149,237,0.3)" }}
                    >
                      {daily.data.ikomah || "-"}
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </Stack>
          </Card>

          {/* ===== SHALAT BERIKUTNYA + WAKTU ADZAN ===== */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: nextPrayer ? "1fr 1fr" : "1fr",
              gap: 10,
            }}
          >
            {/* Shalat Berikutnya */}
            {nextPrayer && (
              <Card
                padding="lg"
                style={{
                  ...glass,
                  background: prayerGlows[nextPrayer.key]?.bg || "rgba(255,255,255,0.05)",
                  boxShadow: prayerGlows[nextPrayer.key]?.glow || "none",
                }}
              >
                <Stack gap="sm" h="100%" justify="space-between">
                  <Group gap="xs">
                    <IconBell size={18} color={prayerGlows[nextPrayer.key]?.accent}
                      style={{ filter: `drop-shadow(0 0 6px ${prayerGlows[nextPrayer.key]?.accent})` }}
                    />
                    <Text size="sm" c="dimmed">Shalat Berikutnya</Text>
                  </Group>

                  <Stack gap="xs" align="center" style={{ flex: 1, justifyContent: "center" }}>
                    {(() => { const Icon = nextPrayer.Icon; return (
                      <Icon size={32} color={prayerGlows[nextPrayer.key]?.accent}
                        style={{ filter: `drop-shadow(0 0 10px ${prayerGlows[nextPrayer.key]?.accent})` }}
                      />
                    ); })()}
                    <Text size="xl" fw={800} c="white">
                      {nextPrayer.label}
                    </Text>
                    <Text size="lg" fw={700} c="white" style={{ opacity: 0.8 }}>
                      {nextPrayer.time}
                    </Text>
                  </Stack>

                  <Badge
                    size="lg"
                    variant="light"
                    color="cyan"
                    radius="xl"
                    style={{
                      backdropFilter: "blur(6px)",
                      background: "rgba(0, 200, 255, 0.12)",
                      border: "1px solid rgba(0, 200, 255, 0.2)",
                      alignSelf: "center",
                    }}
                  >
                    {fmtCountdown(nextPrayer.dt)} lagi
                  </Badge>
                </Stack>
              </Card>
            )}

            {/* Pilih Tanggal */}
            <Card
              padding="lg"
              style={{
                ...glass,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Stack gap="sm" align="center">
                <Group gap="xs">
                  <IconCalendarEvent size={18} color="rgba(255,255,255,0.4)" />
                  <Text size="sm" c="dimmed">Pilih Tanggal</Text>
                </Group>
                <DatePicker
                  locale="id"
                  size="xs"
                  renderDay={(d) => (
                    <Text
                      size="sm"
                      c={
                        dayjs(d).isSame(dayjs(date), "day")
                          ? "green"
                          : isHoliday(dayjs(d).format("YYYY-MM-DD"))
                            ? "red"
                            : undefined
                      }
                    >
                      {dayjs(d).date()}
                    </Text>
                  )}
                  defaultDate={dayjs(date).toDate()}
                  minDate={dayjs("2024-01-01").toDate()}
                  maxDate={dayjs().add(40, "year").toDate()}
                  onChange={(d) => setDate(dayjs(d).toDate())}
                  onYearSelect={(d) =>
                    setDate(dayjs(date).year(dayjs(d).year()).toDate())
                  }
                  onMonthSelect={(d) =>
                    setDate(dayjs(date).month(dayjs(d).month()).toDate())
                  }
                />
              </Stack>
            </Card>
          </Box>

          {/* ===== JADWAL WAKTU SHALAT ===== */}
          <Card
            padding="lg"
            style={{
              ...glass,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Stack gap="md">
              <Group gap="xs">
                <IconBell size={20} color="rgba(255,255,255,0.4)" />
                <Text size="lg" fw={700} c="white">Waktu Adzan</Text>
              </Group>
              <Stack gap={6}>
                {prayerList.map((p) => {
                  const glow = prayerGlows[p.key] || prayerGlows.isha;
                  const Icon = p.Icon;
                  const isNext = nextPrayer?.key === p.key;
                  return (
                    <Paper
                      key={p.key}
                      p="sm"
                      style={{
                        ...glassInner,
                        background: isNext ? glow?.bg : "rgba(255,255,255,0.02)",
                        border: isNext
                          ? `1px solid ${glow?.accent}30`
                          : "1px solid rgba(255,255,255,0.04)",
                        boxShadow: isNext ? glow?.glow : "none",
                        opacity: p.isPast ? 0.5 : 1,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Icon size={20} color={p.isPast ? "rgba(255,255,255,0.3)" : glow?.accent}
                            style={{
                              filter: isNext ? `drop-shadow(0 0 6px ${glow?.accent})` : "none",
                            }}
                          />
                          <Stack gap={0}>
                            <Text size="md" fw={isNext ? 700 : 500} c={p.isPast ? "dimmed" : "white"}>
                              {p.label}
                            </Text>
                            {isNext && (
                              <Text size="xs" c={glow?.accent}>
                                {fmtCountdown(p.dt)} lagi
                              </Text>
                            )}
                          </Stack>
                        </Group>
                        <Group gap="xs">
                          <Text size="md" fw={700} c={p.isPast ? "dimmed" : "white"}
                            style={{
                              textShadow: isNext ? `0 0 10px ${glow?.accent}40` : "none",
                            }}
                          >
                            {p.time}
                          </Text>
                          {isNext && <IconChevronRight size={16} color={glow?.accent} />}
                        </Group>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Stack>
          </Card>

          {/* ===== KALENDER IMAM ===== */}
          <Card
            padding="md"
            style={{
              ...glass,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconCalendarEvent size={20} color="rgba(255,255,255,0.4)" />
                  <Text size="lg" fw={700} c="white">
                    {dayjs(date).format("MMMM YYYY")}
                  </Text>
                </Group>
                <Badge
                  size="sm"
                  variant="light"
                  color="teal"
                  radius="xl"
                  style={{
                    backdropFilter: "blur(6px)",
                    background: "rgba(20, 184, 166, 0.1)",
                    border: "1px solid rgba(20, 184, 166, 0.15)",
                  }}
                >
                  <Group gap={4}>
                    <Box w={6} h={6} style={{ borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px rgba(74,222,128,0.5)" }} />
                    <Text size="xs">= Ada Imam</Text>
                  </Group>
                </Badge>
              </Group>

              <SimpleGrid cols={7} p="xs" style={{
                ...glassInner,
                background: "rgba(255,255,255,0.03)",
              }}>
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((w) => (
                  <Text fw={700} key={w} size="sm" ta="center" c="dimmed">{w}</Text>
                ))}
              </SimpleGrid>

              <SimpleGrid cols={7} spacing={4}>
                {monthGrid.cells.map((cell, idx) => {
                  if (!cell.date) return <div key={idx} />;
                  const d = cell.date;
                  const dayNum = d.date();
                  const iso = d.format("YYYY-MM-DD");
                  const today = d.isSame(dayjs(), "day");
                  const holiday = isHoliday(iso);
                  const imamName = monthly.data.imam?.[String(dayNum)];
                  const hasImam = Boolean(imamName);
                  const selected = d.isSame(dayjs(date), "day");
                  return (
                    <UnstyledButton
                      key={idx}
                      style={{
                        textAlign: "center",
                        padding: 6,
                        borderRadius: 14,
                        minHeight: 48,
                        background: selected
                          ? "rgba(0, 200, 255, 0.12)"
                          : today
                            ? "rgba(56, 189, 248, 0.08)"
                            : "rgba(255,255,255,0.02)",
                        backdropFilter: selected || today ? "blur(10px)" : undefined,
                        WebkitBackdropFilter: selected || today ? "blur(10px)" : undefined,
                        border: holiday
                          ? "1px solid rgba(244, 63, 94, 0.35)"
                          : selected
                            ? "1px solid rgba(0, 200, 255, 0.25)"
                            : today
                              ? "1px solid rgba(56, 189, 248, 0.15)"
                              : "1px solid transparent",
                        boxShadow: selected
                          ? "0 0 20px rgba(0, 200, 255, 0.12)"
                          : today
                            ? "0 0 15px rgba(56, 189, 248, 0.08)"
                            : "none",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setDate(d.toDate())}
                    >
                      <Stack gap={2} align="center" justify="center">
                        {hasImam && (
                          <Box
                            w={6}
                            h={6}
                            style={{
                              borderRadius: "50%",
                              background: "#4ade80",
                              boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)",
                            }}
                          />
                        )}
                        <Text
                          size="md"
                          fw={today || selected ? 800 : 500}
                          c={
                            holiday ? "red"
                              : today ? "cyan"
                                : selected ? "cyan.3"
                                  : "white"
                          }
                          style={{
                            textShadow: today || selected
                              ? "0 0 12px rgba(0, 200, 255, 0.3)"
                              : undefined,
                          }}
                        >
                          {dayNum}
                        </Text>
                      </Stack>
                    </UnstyledButton>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Card>

          {/* ===== JADWAL IMAM BULANAN ===== */}
          <Stack gap="xs">
            <Group gap="xs" pl="xs">
              <IconUsers size={20} color="rgba(255,255,255,0.4)" />
              <Text size="lg" fw={700} c="white">Jadwal Imam Bulanan</Text>
            </Group>
            <ImamUserList />
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
              }}
            >
              {Object.keys(monthly.data.imam).map((d) => {
                const tglNum = Number(d);
                const iso = dayjs(
                  `${year}-${String(month).padStart(2, "0")}-${String(tglNum).padStart(2, "0")}`,
                ).format("YYYY-MM-DD");
                const holiday = isHoliday(iso);
                const isToday = dayjs(iso).isSame(dayjs(), "day");
                return (
                  <Paper
                    key={d}
                    p="md"
                    style={{
                      ...glassSubtle,
                      background: isToday
                        ? "rgba(20, 184, 166, 0.1)"
                        : "rgba(255,255,255,0.03)",
                      border: isToday
                        ? "1px solid rgba(20, 184, 166, 0.2)"
                        : holiday
                          ? "1px solid rgba(244, 63, 94, 0.25)"
                          : "1px solid rgba(255,255,255,0.05)",
                      boxShadow: isToday
                        ? "0 0 25px rgba(20, 184, 166, 0.1)"
                        : "none",
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text
                          size="sm"
                          fw={isToday ? 800 : 600}
                          c={holiday ? "red.4" : isToday ? "cyan" : "dimmed"}
                        >
                          {dayjs(iso).format("ddd, DD MMM")}
                        </Text>
                        {isToday && (
                          <Badge size="xs" variant="light" color="teal" radius="xl"
                            style={{
                              background: "rgba(20,184,166,0.12)",
                              border: "1px solid rgba(20,184,166,0.2)",
                            }}
                          >
                            Hari Ini
                          </Badge>
                        )}
                      </Group>
                      <Divider color="dark.6" style={{ opacity: 0.2 }} />
                      <Stack gap={4}>
                        <Group gap="xs">
                          <IconUserStar size={16} color={isToday ? "#14b8a6" : "rgba(255,255,255,0.35)"}
                            style={{
                              filter: isToday ? "drop-shadow(0 0 4px rgba(20,184,166,0.4))" : "none",
                            }}
                          />
                          <Text size="md" fw={700} c={isToday ? "teal" : "white"}
                            style={{
                              textShadow: isToday ? "0 0 12px rgba(20,184,166,0.25)" : "none",
                            }}
                          >
                            {monthly.data.imam[d]}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <IconClockHour4 size={16} color="rgba(255,255,255,0.3)" />
                          <Text size="sm" fw={500} c="dimmed">
                            Iqomah: {monthly.data.ikomah[d]}
                          </Text>
                        </Group>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          </Stack>

          {/* ===== HARI LIBUR ===== */}
          <Card
            padding="lg"
            style={{
              ...glass,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Stack gap="md">
              <Group gap="xs">
                <IconGift size={20} color="rgba(255,255,255,0.4)" />
                <Text size="lg" fw={700} c="white">
                  Hari Libur Nasional {year}
                </Text>
              </Group>
              {holidays.length > 0 && (
                <Box
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 6,
                  }}
                >
                  {holidays.map((h, idx) => (
                    <Paper
                      key={idx}
                      p="sm"
                      style={{ ...glassInner }}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <IconCalendarStar
                          size={16}
                          color="#14b8a6"
                          style={{
                            flexShrink: 0,
                            filter: "drop-shadow(0 0 4px rgba(20, 184, 166, 0.4))",
                          }}
                        />
                        <Stack gap={0}>
                          <Text size="sm" c="white" fw={600}>
                            {dayjs(h.date).format("DD MMM")}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {h.name}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  ))}
                </Box>
              )}
            </Stack>
          </Card>

          {/* Footer */}
          <Text size="xs" c="dimmed" ta="center" py="md" style={{ opacity: 0.4 }}>
            Jadwal Imam Masjid
          </Text>

        </Stack>
      </Container>
    </Box>
  );
}

function ImamUserList() {
  const { data, error, isLoading } = useSwr(
    "/",
    apiFetch.api["jadwal-sholat"]["user-list"].get,
  );
  if (isLoading) return <Loader size="sm" />;
  if (error) return <Text c="red" size="sm">{error.message}</Text>;
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 6,
      }}
    >
      {data?.data?.data?.map((u) => {
        if (u.active === false) return null;
        return (
          <Paper
            key={u.id}
            p="sm"
            style={{
              ...glassInner,
              textAlign: "center",
            }}
          >
            <Group gap="xs" justify="center">
              <IconStar size={14} color="rgba(20, 184, 166, 0.6)" />
              <Text size="sm" c="white" fw={500}>
                {u.name}
              </Text>
            </Group>
          </Paper>
        );
      })}
    </Box>
  );
}
