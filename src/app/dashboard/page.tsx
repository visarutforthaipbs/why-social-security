"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Input,
  Button,
  Badge,
  Spinner,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiCheckSquare,
} from "react-icons/fi";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SectionCount {
  _id: string;
  count: number;
}

interface BenefitsStats {
  healthcare?: number;
  retirement?: number;
  unemployment?: number;
  disability?: number;
  childSupport?: number;
  withOther?: number;
}

interface DailyCount {
  _id: string;
  count: number;
}

interface RecentSubmission {
  _id: string;
  sectionType: string;
  userData: {
    name?: string;
    age?: string;
    occupation?: string;
    usedBenefits?: string[];
  };
  suggestedBenefits: {
    healthcare: boolean;
    retirement: boolean;
    unemployment: boolean;
    disability: boolean;
    childSupport: boolean;
    other: string;
  };
  createdAt: string;
}

interface DashboardStats {
  total: number;
  todayCount: number;
  weekCount: number;
  bySection: SectionCount[];
  benefitsStats: BenefitsStats;
  dailyStats: DailyCount[];
  recentSubmissions: RecentSubmission[];
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 30;

const SECTION_LABELS: Record<string, string> = {
  "33": "มาตรา 33",
  "39": "มาตรา 39",
  "40": "มาตรา 40",
  "40-1": "มาตรา 40 (ทางเลือก 1)",
  "40-2": "มาตรา 40 (ทางเลือก 2)",
  "40-3": "มาตรา 40 (ทางเลือก 3)",
  notRegYet: "ยังไม่ได้ลงทะเบียน",
};

const SECTION_COLORS: Record<string, string> = {
  "33": "blue",
  "39": "green",
  "40": "orange",
  "40-1": "orange",
  "40-2": "yellow",
  "40-3": "red",
  notRegYet: "gray",
};

const BENEFIT_KEYS: Array<{ key: keyof BenefitsStats; label: string }> = [
  { key: "healthcare", label: "สุขภาพ / รักษาพยาบาล" },
  { key: "retirement", label: "เกษียณอายุ / ชราภาพ" },
  { key: "unemployment", label: "ว่างงาน" },
  { key: "disability", label: "ทุพพลภาพ" },
  { key: "childSupport", label: "สงเคราะห์บุตร" },
  { key: "withOther", label: "อื่นๆ (ระบุเพิ่มเติม)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const countSuggested = (s: RecentSubmission["suggestedBenefits"]) =>
  [s.healthcare, s.retirement, s.unemployment, s.disability, s.childSupport].filter(Boolean).length +
  (s.other ? 1 : 0);

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  helpText,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  helpText?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <Box bg="white" borderRadius="xl" p={5} shadow="sm" borderTop="4px solid" borderColor={accent ?? "#3D3A7E"}>
      <Flex justify="space-between" align="flex-start">
        <Stat>
          <StatLabel color="gray.500" fontSize="sm">{label}</StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" color="gray.800">{value}</StatNumber>
          {helpText && <StatHelpText color="gray.400" fontSize="xs">{helpText}</StatHelpText>}
        </Stat>
        <Box color={accent ?? "#3D3A7E"} fontSize="2xl" mt={1}>{icon}</Box>
      </Flex>
    </Box>
  );
}

function HorizontalBarChart({
  data,
  total,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  total: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <VStack spacing={3} align="stretch">
      {data.map(({ label, value, color }) => (
        <Box key={label}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="sm" color="gray.700">{label}</Text>
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              {value}&nbsp;
              <Text as="span" color="gray.400" fontWeight="normal">
                ({total > 0 ? Math.round((value / total) * 100) : 0}%)
              </Text>
            </Text>
          </Flex>
          <Progress
            value={(value / max) * 100}
            colorScheme={color ?? "purple"}
            borderRadius="full"
            size="sm"
            bg="gray.100"
          />
        </Box>
      ))}
    </VStack>
  );
}

function MiniBarChart({ data }: { data: DailyCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  if (data.length === 0) {
    return <Text color="gray.400" fontSize="sm" textAlign="center" py={6}>ไม่มีข้อมูลใน 30 วันที่ผ่านมา</Text>;
  }
  return (
    <Flex align="flex-end" gap="2px" h="80px" w="100%">
      {data.map((d) => (
        <Tooltip key={d._id} label={`${d._id}: ${d.count} รายการ`} hasArrow>
          <Box
            flex="1"
            minW="8px"
            bg="#3D3A7E"
            h={`${Math.max((d.count / max) * 100, 4)}%`}
            borderRadius="sm"
            cursor="pointer"
            opacity={0.8}
            _hover={{ opacity: 1 }}
            transition="opacity 0.15s"
          />
        </Tooltip>
      ))}
    </Flex>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({
  onLogin,
  error,
}: {
  onLogin: (pwd: string) => void;
  error: string | null;
}) {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);

  const submit = () => {
    if (pwd.trim()) onLogin(pwd.trim());
  };

  return (
    <Flex minH="100vh" bg="#F5F5F5" align="center" justify="center">
      <Box bg="white" borderRadius="2xl" shadow="lg" p={10} w="full" maxW="400px">
        <VStack spacing={6}>
          <Box textAlign="center">
            <Box
              w={12}
              h={12}
              borderRadius="xl"
              bg="#3D3A7E"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <FiUsers color="white" size={24} />
            </Box>
            <Heading size="md" color="#3D3A7E">Dashboard</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>ผลการสำรวจประกันสังคม — Internal Only</Text>
          </Box>

          {error && (
            <Alert status="error" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="รหัสผ่าน"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              borderRadius="lg"
              focusBorderColor="#3D3A7E"
            />
            <InputRightElement>
              <IconButton
                aria-label="toggle password"
                icon={show ? <FiEyeOff /> : <FiEye />}
                size="sm"
                variant="ghost"
                onClick={() => setShow(!show)}
              />
            </InputRightElement>
          </InputGroup>

          <Button
            w="full"
            bg="#3D3A7E"
            color="white"
            borderRadius="lg"
            onClick={submit}
            _hover={{ bg: "#2D2A6E" }}
          >
            เข้าสู่ระบบ
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [mounted, setMounted] = useState(false);

  // Hydration guard + restore saved password
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("_db_pwd");
    if (saved) setSavedPassword(saved);
  }, []);

  const fetchStats = useCallback(
    async (pwd: string) => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${pwd}` },
          cache: "no-store",
        });
        if (res.status === 401) {
          localStorage.removeItem("_db_pwd");
          setSavedPassword(null);
          setAuthError("รหัสผ่านไม่ถูกต้อง");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DashboardStats = await res.json();
        setStats(data);
        setCountdown(REFRESH_INTERVAL);
      } catch {
        setFetchError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // First fetch when password is set
  useEffect(() => {
    if (savedPassword) fetchStats(savedPassword);
  }, [savedPassword, fetchStats]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!savedPassword) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchStats(savedPassword);
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [savedPassword, fetchStats]);

  const handleLogin = (pwd: string) => {
    setAuthError(null);
    localStorage.setItem("_db_pwd", pwd);
    setSavedPassword(pwd);
  };

  const handleLogout = () => {
    localStorage.removeItem("_db_pwd");
    setSavedPassword(null);
    setStats(null);
    setAuthError(null);
    setFetchError(null);
  };

  // Don't render until mounted (avoid hydration mismatch for localStorage)
  if (!mounted) return null;

  if (!savedPassword) {
    return (
      <PasswordGate
        onLogin={handleLogin}
        error={authError}
      />
    );
  }

  // ── Dashboard shell ──────────────────────────────────────────────────────

  return (
    <Box minH="100vh" bg="#F5F5F5">
      {/* Header */}
      <Box bg="#3D3A7E" color="white" px={6} py={4} shadow="md">
        <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
          <Box>
            <Heading size="md" fontWeight="bold">Dashboard — ผลการสำรวจประกันสังคม</Heading>
            <Text fontSize="xs" color="whiteAlpha.700" mt={0.5}>
              Internal Use Only
              {stats?.updatedAt && (
                <> · อัปเดตล่าสุด {formatDateTime(stats.updatedAt)}</>
              )}
            </Text>
          </Box>
          <HStack spacing={3}>
            <HStack
              spacing={2}
              bg="whiteAlpha.200"
              borderRadius="lg"
              px={3}
              py={2}
              fontSize="sm"
            >
              <FiRefreshCw size={14} />
              <Text>รีเฟรชใน {countdown}s</Text>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              color="white"
              leftIcon={<FiRefreshCw />}
              onClick={() => fetchStats(savedPassword)}
              isLoading={loading}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              รีเฟรช
            </Button>
            <IconButton
              aria-label="logout"
              icon={<FiLogOut />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={handleLogout}
            />
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box maxW="1400px" mx="auto" px={6} py={6}>
        {fetchError && (
          <Alert status="error" borderRadius="xl" mb={6} fontSize="sm">
            <AlertIcon />
            {fetchError}
          </Alert>
        )}

        {!stats && loading && (
          <Flex justify="center" align="center" h="60vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="#3D3A7E" thickness="4px" />
              <Text color="gray.500">กำลังโหลดข้อมูล...</Text>
            </VStack>
          </Flex>
        )}

        {stats && (
          <VStack spacing={6} align="stretch">
            {/* ── Stat Cards ──────────────────────────────────────────── */}
            <Grid templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={4}>
              <GridItem>
                <StatCard
                  label="ผู้ตอบแบบสำรวจทั้งหมด"
                  value={stats.total}
                  helpText="นับถึงปัจจุบัน"
                  icon={<FiUsers />}
                  accent="#3D3A7E"
                />
              </GridItem>
              <GridItem>
                <StatCard
                  label="วันนี้"
                  value={stats.todayCount}
                  helpText="รายการใหม่ในวันนี้"
                  icon={<FiCalendar />}
                  accent="#f3762a"
                />
              </GridItem>
              <GridItem>
                <StatCard
                  label="7 วันที่ผ่านมา"
                  value={stats.weekCount}
                  helpText="รายการใน 7 วันล่าสุด"
                  icon={<FiTrendingUp />}
                  accent="#38a169"
                />
              </GridItem>
              <GridItem>
                <StatCard
                  label="กลุ่มที่มากที่สุด"
                  value={
                    stats.bySection[0]
                      ? SECTION_LABELS[stats.bySection[0]._id] ?? stats.bySection[0]._id
                      : "-"
                  }
                  helpText={
                    stats.bySection[0]
                      ? `${stats.bySection[0].count} รายการ`
                      : undefined
                  }
                  icon={<FiCheckSquare />}
                  accent="#f9e448"
                />
              </GridItem>
            </Grid>

            {/* ── Charts Row ──────────────────────────────────────────── */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
              {/* Section type breakdown */}
              <GridItem>
                <Box bg="white" borderRadius="xl" p={6} shadow="sm" h="full">
                  <Heading size="sm" mb={5} color="gray.700">สัดส่วนตามกลุ่มมาตรา</Heading>
                  <HorizontalBarChart
                    total={stats.total}
                    data={stats.bySection.map((s) => ({
                      label: SECTION_LABELS[s._id] ?? s._id,
                      value: s.count,
                      color: "purple",
                    }))}
                  />
                </Box>
              </GridItem>

              {/* Suggested benefits breakdown */}
              <GridItem>
                <Box bg="white" borderRadius="xl" p={6} shadow="sm" h="full">
                  <Heading size="sm" mb={5} color="gray.700">สิทธิที่อยากเพิ่ม</Heading>
                  <HorizontalBarChart
                    total={stats.total}
                    data={BENEFIT_KEYS.map(({ key, label }) => ({
                      label,
                      value: stats.benefitsStats[key] ?? 0,
                      color: "orange",
                    }))}
                  />
                </Box>
              </GridItem>
            </Grid>

            {/* ── Daily Chart ─────────────────────────────────────────── */}
            <Box bg="white" borderRadius="xl" p={6} shadow="sm">
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="sm" color="gray.700">จำนวนผู้ตอบรายวัน (30 วันที่ผ่านมา)</Heading>
                <Text fontSize="xs" color="gray.400">{stats.dailyStats.length} วันที่มีข้อมูล</Text>
              </Flex>
              <MiniBarChart data={stats.dailyStats} />
              <Flex justify="space-between" mt={2}>
                <Text fontSize="xs" color="gray.400">{stats.dailyStats[0]?._id ?? ""}</Text>
                <Text fontSize="xs" color="gray.400">{stats.dailyStats[stats.dailyStats.length - 1]?._id ?? ""}</Text>
              </Flex>
            </Box>

            {/* ── Recent Submissions ──────────────────────────────────── */}
            <Box bg="white" borderRadius="xl" shadow="sm" overflow="hidden">
              <Box px={6} py={4} borderBottom="1px solid" borderColor="gray.100">
                <Heading size="sm" color="gray.700">รายการล่าสุด 20 รายการ</Heading>
              </Box>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th color="gray.500" fontSize="xs">วันที่-เวลา</Th>
                      <Th color="gray.500" fontSize="xs">กลุ่ม</Th>
                      <Th color="gray.500" fontSize="xs">อายุ</Th>
                      <Th color="gray.500" fontSize="xs">อาชีพ</Th>
                      <Th color="gray.500" fontSize="xs" isNumeric>สิทธิที่ใช้</Th>
                      <Th color="gray.500" fontSize="xs" isNumeric>สิทธิที่อยากเพิ่ม</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stats.recentSubmissions.map((s) => (
                      <Tr key={s._id} _hover={{ bg: "gray.50" }}>
                        <Td fontSize="xs" color="gray.500" whiteSpace="nowrap">
                          {formatDateTime(s.createdAt)}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={SECTION_COLORS[s.sectionType] ?? "gray"}
                            fontSize="xs"
                            borderRadius="full"
                            px={2}
                          >
                            {SECTION_LABELS[s.sectionType] ?? s.sectionType}
                          </Badge>
                        </Td>
                        <Td fontSize="sm">{s.userData?.age ?? "-"}</Td>
                        <Td fontSize="sm" maxW="160px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {s.userData?.occupation ?? "-"}
                        </Td>
                        <Td fontSize="sm" isNumeric>
                          {(s.userData?.usedBenefits ?? []).length}
                        </Td>
                        <Td fontSize="sm" isNumeric>
                          {countSuggested(s.suggestedBenefits)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </VStack>
        )}
      </Box>
    </Box>
  );
}
