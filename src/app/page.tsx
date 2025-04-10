"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FiUser,
  FiDollarSign,
  FiHeart,
  FiChevronUp,
  FiChevronDown,
  FiCheck,
  FiMessageSquare,
} from "react-icons/fi";
import Footer from "@/components/Footer";
import { ChakraButton } from "@/components/ChakraButton";
import { ChakraCard } from "../components/ChakraCard";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  Icon,
  Button,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  useToast,
  SimpleGrid,
  Checkbox,
  Textarea,
} from "@chakra-ui/react";
import { saveFeedback } from "@/services/feedbackService";

// Define section types for type safety
type Section =
  | "home"
  | "selection"
  | "section40Options"
  | "currentBenefits"
  | "userInput"
  | "suggestBenefits"
  | "end";

// Define section type for the social security section types
type SectionType =
  | "33"
  | "39"
  | "40"
  | "40-1"
  | "40-2"
  | "40-3"
  | "notRegYet"
  | null;

// Define benefit detail interface
interface BenefitDetail {
  description: string;
  limit: string;
  conditions: string;
}

// Define user data interface
interface UserData {
  name: string;
  age: string;
  occupation: string;
  yearsContributing: string;
  monthsContributing?: string;
  monthlyContribution: string;
  usedBenefits: string[];
  // Add new fields for section 39
  yearsSection33?: string;
  monthsSection33?: string;
  monthlySection33?: string;
  yearsSection39?: string;
  monthsSection39?: string;
  [key: string]: string | string[] | undefined;
}

// Define suggested benefits interface
interface SuggestedBenefits {
  healthcare: boolean;
  retirement: boolean;
  unemployment: boolean;
  disability: boolean;
  childSupport: boolean;
  other: string;
  userIdea: string;
}

export default function Home() {
  const [currentSection, setCurrentSection] = useState<Section>("home");
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigateTo = (section: Section) => {
    setCurrentSection(section);
    // Scroll to top when changing sections
    window.scrollTo(0, 0);
  };

  // State to track user data
  const [selectedSection, setSelectedSection] = useState<SectionType>(null);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    age: "",
    occupation: "",
    yearsContributing: "",
    monthsContributing: "",
    monthlyContribution: "",
    usedBenefits: [],
    yearsSection33: "",
    monthsSection33: "",
    monthlySection33: "",
    yearsSection39: "",
    monthsSection39: "",
  });
  const [suggestedBenefits, setSuggestedBenefits] = useState<SuggestedBenefits>(
    {
      healthcare: false,
      retirement: false,
      unemployment: false,
      disability: false,
      childSupport: false,
      other: "",
      userIdea: "",
    }
  );

  // State to track which benefit detail is expanded
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);

  // Get default contribution amount based on selected section type
  const getDefaultContribution = () => {
    if (selectedSection === "33") {
      return "750"; // For salary > 15,000 baht
    } else if (selectedSection === "39") {
      return "432";
    } else if (selectedSection === "40") {
      return "100"; // Middle option as default
    }
    return "";
  };

  // Set default contribution value when section changes
  useEffect(() => {
    if (!userData.monthlyContribution && selectedSection) {
      updateUserData({ monthlyContribution: getDefaultContribution() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection, userData.monthlyContribution]);

  // Handler for updating user data
  const updateUserData = (newData: Partial<UserData>) => {
    setUserData({ ...userData, ...newData });
  };

  // Handler for toggling used benefits
  const toggleUsedBenefit = (benefit: string) => {
    const usedBenefits = [...userData.usedBenefits];
    if (usedBenefits.includes(benefit)) {
      // Remove benefit if already in array
      const updatedBenefits = usedBenefits.filter((item) => item !== benefit);
      updateUserData({ usedBenefits: updatedBenefits });
    } else {
      // Add benefit if not in array
      updateUserData({ usedBenefits: [...usedBenefits, benefit] });
    }
  };

  // Toggle expanded benefit
  const toggleExpandedBenefit = (benefit: string) => {
    if (expandedBenefit === benefit) {
      setExpandedBenefit(null);
    } else {
      setExpandedBenefit(benefit);
    }
  };

  // Handler for selecting section type (33, 39, 40)
  const handleSectionTypeSelect = (type: SectionType) => {
    setSelectedSection(type);
    if (type === "40") {
      navigateTo("section40Options");
    } else {
      navigateTo("currentBenefits");
    }
  };

  // Handler for selecting specific section 40 option
  const handleSection40OptionSelect = (option: "40-1" | "40-2" | "40-3") => {
    setSelectedSection(option);
    navigateTo("currentBenefits");
  };

  // Handler for updating suggested benefits
  const updateSuggestedBenefits = (
    field: keyof SuggestedBenefits,
    value: boolean | string
  ) => {
    setSuggestedBenefits((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reusable checked list item component
  const CheckedListItem = ({ text }: { text: string }) => (
    <Flex alignItems="center">
      <Flex
        bg="orange.100"
        rounded="full"
        p={1}
        mr={2}
        alignItems="center"
        justifyContent="center"
        minW="18px"
        h="18px"
      >
        <Icon as={FiCheck} color="orange.500" boxSize={3} />
      </Flex>
      <Text fontSize="sm">{text}</Text>
    </Flex>
  );

  // Handler for submitting feedback to MongoDB
  const handleSubmitFeedback = async () => {
    // For users who haven't selected a section, we don't require section validation
    if (
      selectedSection === "notRegYet" &&
      currentSection === "suggestBenefits"
    ) {
      // For non-registered users, at least require some suggestion in the text area
      if (
        !suggestedBenefits.other.trim() &&
        !suggestedBenefits.healthcare &&
        !suggestedBenefits.retirement &&
        !suggestedBenefits.unemployment &&
        !suggestedBenefits.disability
      ) {
        toast({
          title: "กรุณาเลือกหรือระบุสิทธิประโยชน์ที่คุณต้องการ",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    } else if (!selectedSection) {
      toast({
        title: "กรุณาเลือกประเภทประกันสังคมของคุณ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await saveFeedback({
        sectionType: selectedSection,
        userData,
        suggestedBenefits,
      });

      if (result.success) {
        navigateTo("end");
        toast({
          title: "ส่งข้อมูลสำเร็จ",
          description: "ขอบคุณสำหรับความคิดเห็นของคุณ",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.error || "ไม่สามารถส่งข้อมูลได้ กรุณาลองอีกครั้ง",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองอีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render appropriate section based on currentSection state
  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return renderHomeSection();
      case "selection":
        return renderSelectionSection();
      case "section40Options":
        return renderSection40OptionsSection();
      case "currentBenefits":
        return renderCurrentBenefitsSection();
      case "userInput":
        return renderUserInputSection();
      case "suggestBenefits":
        return renderSuggestBenefitsSection();
      case "end":
        return renderEndSection();
      default:
        return renderHomeSection();
    }
  };

  // Home Section
  const renderHomeSection = () => {
    return (
      <>
        {/* Hero Section */}
        <Box
          position="relative"
          overflow="hidden"
          bg="background.main"
          py={{ base: 24, md: 32 }}
        >
          <Container maxW="7xl" position="relative" zIndex="10">
            <Grid
              templateColumns={{ md: "repeat(2, 1fr)" }}
              gap={10}
              alignItems="center"
            >
              <Box>
                <Heading
                  as="h1"
                  fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                  fontWeight="bold"
                  mb={6}
                >
                  จ่าย{" "}
                  <Text as="span" color="accent.500">
                    ประกันสังคม
                  </Text>{" "}
                  <br /> ทุกเดือน — แต่ไม้รู้{" "}
                  <Text
                    as="span"
                    textDecoration="underline"
                    textDecorationColor="accent.500"
                  >
                    <br /> ใช้ทำอะไรบ้าง
                  </Text>
                </Heading>
                <Text fontSize={{ base: "lg", md: "xl" }} mb={8}>
                  มารู้จักสิทธิของคุณในประกันสังคม
                  <br /> และร่วมออกแบบประกันสังคมดี ๆ ที่เราอยากเห็น
                </Text>
                <ChakraButton
                  text="ประกันสังคมไปต่อ"
                  buttonType="primary"
                  showArrow={true}
                  onClick={() => navigateTo("selection")}
                />
              </Box>
              <Flex justify="center">
                <Image
                  src="/cover-gif.gif"
                  alt="คนรุ่นใหม่ที่หลากหลาย"
                  width={700}
                  height={700}
                  priority
                  className="drop-shadow-lg w-full h-auto max-w-[500px]"
                />
              </Flex>
            </Grid>
          </Container>
        </Box>
      </>
    );
  };

  // Current Benefits Section
  const renderCurrentBenefitsSection = () => {
    // Content based on which section was selected
    const benefits = {
      "33": [
        "กรณีเจ็บป่วย",
        "กรณีคลอดบุตร",
        "กรณีทุพพลภาพ",
        "กรณีเสียชีวิต",
        "กรณีชราภาพ",
        "กรณีว่างงาน",
        "กรณีสงเคราะห์บุตร",
      ],
      "39": [
        "กรณีเจ็บป่วย",
        "กรณีคลอดบุตร",
        "กรณีทุพพลภาพ",
        "กรณีเสียชีวิต",
        "กรณีชราภาพ",
        "กรณีสงเคราะห์บุตร",
      ],
      "40": [
        "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
        "กรณีทุพพลภาพ",
        "กรณีเสียชีวิต",
        "เงินบำเหน็จชราภาพ",
      ],
      "40-1": [
        "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
        "เงินทดแทนกรณีทุพพลภาพ",
        "เงินค่าทำศพ",
      ],
      "40-2": [
        "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
        "เงินทดแทนกรณีทุพพลภาพ",
        "เงินค่าทำศพ",
        "เงินบำเหน็จชราภาพ",
      ],
      "40-3": [
        "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
        "เงินทดแทนกรณีทุพพลภาพ",
        "เงินค่าทำศพ",
        "เงินบำเหน็จชราภาพ",
        "เงินสงเคราะห์บุตร",
      ],
      notRegYet: [],
    };

    // Add detailed descriptions for each benefit
    const benefitDetails: Record<string, BenefitDetail> = {
      กรณีเจ็บป่วย: {
        description:
          "กรณีประสบอันตรายหรือเจ็บป่วย ครอบคลุมถึงเหตุที่ไม่เกิดจากการทำงาน",
        limit:
          "• เข้ารักษาในสถานพยาบาลที่ที่อยู่ในเครือข่ายของโรงพยาบาลตามสิทธิฯ โดยไม่ต้องเสียค่าใช้จ่าย\n• กรณีต้องหยุดงานพักรักษาตัวตามคำสั่งแพทย์  ได้รับเงินทดแทนการขาดรายได้ 50% ของค่าจ้าง ครั้งละไม่เกิน 90 วัน และไม่เกิน 180 วันต่อปี เว้นแต่ป่วยด้วยโรคเรื้อรังไม่เกิน 365 วันต่อปี\n• กรณีประสบอันตรายหรือเจ็บป่วยฉุกเฉินวิกฤต ผู้ประกันตนไม่ต้องสำรองจ่าย สำนักงานฯ จะรับผิดชอบค่าบริการทางการแพทย์จนพ้นภาวะวิกฤตภายใน 72 ชั่วโมง (นับรวมวันหยุดราชการ) ให้แก่สถานพยาบาลเอกชนที่รักษา\n• ถอนฟัน อุดฟัน ขูดหินปูน และผ่าตัดฟันคุด ได้ไม่เกิน 900 บาทต่อปี หากรับบริการในสถานพยาบาลที่ทำความตกลงกับสำนักงานฯ ไม่ต้องสำรองจ่าย  ผู้ประกันตนจ่ายค่าบริการทางการแพทย์เฉพาะส่วนเกินจากสิทธิที่ได้รับ ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 3 เดือน ภายในระยะเวลา 15 เดือน ก่อนวันรับบริการทางการแพทย์\n\n*ค่าบริการทางการแพทย์ จ่ายตามหลักเกณฑ์และอัตราที่คณะกรรมการการแพทย์กำหนด",
      },
      กรณีคลอดบุตร: {
        description:
          "เงินค่าคลอดบุตร ค่าตรวจและฝากครรภ์ และเงินสงเคราะห์การหยุดงานเพื่อการคลอดบุตร",
        limit:
          "• ค่าคลอดบุตรเหมาจ่าย 15,000 บาทต่อครั้ง (ไม่จำกัดจำนวนครั้ง)\n• เงินสงเคราะห์การหยุดงานสำหรับผู้ประกันตนหญิง 50% ของค่าจ้าง เป็นเวลา 90 วัน ไม่เกิน 2 ครั้ง\n• กรณีสามีและภรรยาเป็นผู้ประกันตนทั้งคู่ให้ใช้สิทธิของฝ่ายใดฝ่ายหนึ่ง\n • ค่าตรวจและรับฝากครรภ์ เท่าที่จ่ายจริง จำนวน 5 ครั้ง ไม่เกิน 1,500 บาท ตามหลักเกณฑ์และอัตราที่คณะกรรมการการแพทย์กำหนด ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 5 เดือน ภายในระยะเวลา 15 เดือน ก่อนเดือนที่คลอดบุตร\n\n*ค่าบริการทางการแพทย์ จ่ายตามหลักเกณฑ์และอัตราที่คณะกรรมการการแพทย์กำหนด",
      },
      กรณีทุพพลภาพ: {
        description: "เงินทดแทนการขาดรายได้ และค่ารักษาพยาบาลทางการแพทย์",
        limit:
          "• ทุพพลภาพรุนแรง ได้รับเงินทดแทนการขาดรายได้ในอัตรา 50% ของค่าจ้างเป็นรายเดือน ตลอดชีวิต\n• ทุพพลภาพไม่รุนแรง ได้รับเงินทดแทนการขาดรายได้ ตามหลักเกณฑ์และระยะเวลาตามประกาศฯ กำหนด\n• ค่าบริการทางการแพทย์ โรงพยาบาลรัฐ จ่ายเท่าที่จ่ายจริงตามความจำเป็น\n • ค่าบริการทางการแพทย์ โรงพยาบาลเอกชน ผู้ป่วยนอกจ่ายตามจริงไม่เกิน 2,000 บาทต่อเดือน  ผู้ป่วยในจ่ายตามจริงไม่เกิน 4,000 บาทต่อเดือน ส่วนค่ารถพยาบาลไม่เกิน 500 บาทต่อเดือน\n • เมื่อเสียชีวิตจากการทุพพลภาพ จะได้สิทธิเช่นเดียวกับกรณีเสียชีวิต ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 3 เดือน ภายในระยะเวลา 15 เดือน ก่อนทุพพลภาพ\n\n*ค่าบริการทางการแพทย์ จ่ายตามหลักเกณฑ์และอัตราที่คณะกรรมการการแพทย์กำหนด",
      },
      กรณีเสียชีวิต: {
        description: "เงินช่วยเหลือค่าทำศพให้แก่ผู้จัดการศพ",
        limit:
          "• 50,000 บาท โดยจ่ายให้แก่ผู้จัดการศพ\n• จ่ายเงินสมทบ 36 เดือน (3 ปี) แต่ไม่ถึง 120 เดือน (10 ปี) ได้รับเงินสงเคราะห์เท่ากับค่าจ้างเฉลี่ย 2 เดือน\n• จ่ายเงินสมทบ 120 เดือนขึ้นไป ได้รับเงินสงเคราะห์เท่ากับค่าจ้างเฉลี่ย 6 เดือน ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 1 เดือน ภายในระยะเวลา 6 เดือน ก่อนเสียชีวิต",
      },
      กรณีชราภาพ: {
        description:
          "เงินบำเน็จ (จ่ายครั้งเดียว) หรือเงินบำนาญ (จ่ายรายเดือนตลอดชีวิต)",
        limit:
          "• จ่ายเงินสมทบไม่ถึง 12 เดือน ได้รับเงินเท่ากับเงินสมทบกรณีชราภาพที่ผู้ประกันตนจ่าย\n• จ่ายเงินสมทบ 12 เดือน แต่ไม่ถึง 180 เดือน ได้รับเงินเท่ากับจำนวนเงินสมทบกรณีชราภาพที่ผู้ประกันตนและนายจ้างจ่าย\n• จ่ายเงินสมทบครบ 180 เดือน (15 ปี) จะได้รับบำนาญชราภาพ 20% ของค่าจ้างเฉลี่ย 60 เดือน (5 ปี) สุดท้าย\n • จ่ายเงินสมทบเกิน 180 เดือน จะได้รับเพิ่ม 1.5% ต่อระยะเวลาการจ่ายเงินสมทบครบทุก 12 เดือน ",
        conditions: "มีอายุครบ 55 ปีบริบูรณ์ และสิ้นสุดความเป็นผู้ประกันตน",
      },
      กรณีว่างงาน: {
        description:
          "เงินทดแทนการขาดรายได้กรณีถูกเลิกจ้าง ลาออกหรือสิ้นสุดสัญญาจ้าง และว่างงานจากเหตุสุดวิสัย",
        limit:
          "• กรณีถูกเลิกจ้าง ได้เงิน 50% ของค่าจ้าง (ไม่เกินเดือนละ 15,000 บาท) ไม่เกิน 180 วัน/ปี\n• กรณีลาออกหรือสิ้นสุดสัญญาจ้างงาน ได้เงิน 30% ของค่าจ้าง (ไม่เกินเดือนละ 15,000 บาท) ไม่เกิน 90 วัน/ปี\n• กรณีว่างงานจากเหตุภัยพิบัติ  ได้เงิน 50% ของค่าจ้าง (ไม่เกินเดือนละ 15,000 บาท) ไม่เกิน 180 วัน/ปี\n• กรณีว่างงานจากการระบาดของโรคติดต่อ  ได้เงิน 50% ของค่าจ้าง (ไม่เกินเดือนละ 15,000 บาท) ไม่เกิน 90 วัน/ปี ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 6 เดือน ภายในระยะเวลา 15 เดือนก่อนการว่างงาน และต้องขึ้นทะเบียนในเว็บไซต์ของกรมการจัดหางาน",
      },
      กรณีสงเคราะห์บุตร: {
        description: "เงินสงเคราะห์บุตรเหมาจ่ายรายเดือนสำหรับบุตรตามกฎหมาย",
        limit:
          "เงิน 800 บาทต่อเดือนต่อบุตร 1 คน คราวละไม่เกิน 3 คน สำหรับบุตรแรกเกิดแต่ไม่เกิน 6 ปี",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 12 เดือน ภายในระยะเวลา 36 เดือน ก่อนเดือนที่มีสิทธิ",
      },
      เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย: {
        description:
          "เงินทดแทนการขาดรายได้กรณีเจ็บป่วยที่ไม่ได้เกิดจากการทำงาน",
        limit:
          selectedSection === "40-3"
            ? "• นอนพักรักษาในโรงพยาบาลตั้งแต่ 1 วันขึ้นไป ได้รับวันละ 300 บาท\n• ไม่นอนพักรักษาตัวในโรงพยาบาล แต่มีใบรับรองแพทย์ให้หยุดพักรักษาตัวตั้งแต่ 3 วันขึ้นไป วันละ 200 บาท\n• รับสิทธิรวมกันไม่เกิน 90 วันต่อปี"
            : "• นอนพักรักษาตัวในโรงพยาบาลตั้งแต่ 1 วันขึ้นไป วันละ 300 บาท\n• ไม่นอนพักรักษาตัวในโรงพยาบาล แต่มีใบรับรองแพทย์ให้หยุดพักรักษาตัว หรือ ให้หยุดพักรักษาตัวไม่เกิน 2 วัน (มีใบรับรองแพทย์มาแสดง) ครั้งละ 50 บาท ไม่เกิน 3 ครั้งต่อปี\n• รับสิทธิรวมกันไม่เกิน 30 วันต่อปี",
        conditions:
          "จ่ายเงินสมทบไม่น้อยกว่า 3 ใน 4 เดือน ก่อนเดือนที่ประสบอันตรายหรือเจ็บป่วย\n\n*หมายเหตุ: สิทธิการรักษาใช้สิทธิหลักประกันสุขภาพ/บัตรทอง (สปสช.) หรือสิทธิเดิมที่มีอยู่",
      },
      เงินบำเหน็จชราภาพ: {
        description:
          "เงินก้อนที่จ่ายให้ครั้งเดียวเมื่อมีอายุครบ 60 ปีและสิ้นสุดความเป็นผู้ประกันตน",
        limit:
          selectedSection === "40-3"
            ? "• ได้รับเงินบำเหน็จชราภาพ (เงินสมทบ 150 บาท คูณด้วยจำนวนเดือนที่จ่ายเงินสมทบ บวกกับเงินออมเพิ่ม) พร้อมผลประโยชน์ตอบแทนรายปีตามที่สำนักงานประกันสังคมกำหนด"
            : "• ได้รับเงินบำเหน็จชราภาพ (เงินสมทบ 50 บาท คูณด้วยจำนวนเดือนที่จ่ายเงินสมทบ บวกกับเงินออมเพิ่ม) พร้อมผลประโยชน์ตอบแทนรายปีตามที่สำนักงานประกันสังคมกำหนด",
        conditions:
          "• เมื่ออายุครบ 60 ปีบริบูรณ์ และสิ้นสุดความเป็นผู้ประกันตน\n• ผู้ประกันตนทางเลือกที่ 2 และ 3 สามารถจ่ายเงินสมทบเพิ่มเติม (ออมเพิ่ม) ได้ไม่เกิน 1,000 บาท ต่อเดือน",
      },
      เงินทดแทนกรณีทุพพลภาพ: {
        description: "เงินทดแทนการขาดรายได้กรณีทุพพลภาพ",
        limit:
          selectedSection === "40-3"
            ? "• ได้รับเงินทดแทนการขาดรายได้ต่อเดือน ตลอดชีวิต\n• หากเสียชีวิตระหว่างรับเงินทดแทนฯ จะได้รับเงินค่าทำศพ 50,000 บาท"
            : "• ได้รับเงินทดแทนการขาดรายได้ต่อเดือนนาน 15 ปี\n• หากเสียชีวิตระหว่างรับเงินทดแทนฯ จะได้รับเงินค่าทำศพ 25,000 บาท",
        conditions:
          "• จ่ายเงินสมทบมาแล้ว 6 เดือนใน 10 เดือน ก่อนเดือนทุพพลภาพ ได้รับ 500 บาท\n• จ่ายเงินสมทบมาแล้ว 12 เดือนใน 20 เดือน ก่อนเดือนทุพพลภาพ ได้รับ 650 บาท\n• จ่ายเงินสมทบมาแล้ว 24 เดือนใน 40 เดือน ก่อนเดือนทุพพลภาพ ได้รับ 800 บาท\n• จ่ายเงินสมทบมาแล้ว 36 เดือนใน 60 เดือน ก่อนเดือนทุพพลภาพ ได้รับ 1,000 บาท",
      },
      เงินค่าทำศพ: {
        description: "เงินค่าทำศพและเงินสงเคราะห์กรณีตาย",
        limit:
          selectedSection === "40-3"
            ? "• ได้รับเงินค่าทำศพ 50,000 บาท จ่ายให้กับผู้จัดการศพ"
            : "• ได้รับเงินค่าทำศพ 25,000 บาท จ่ายให้กับผู้จัดการศพ\n• ได้รับเงินสงเคราะห์กรณีตาย 8,000 บาท หากจ่ายเงินสมทบไม่น้อยกว่า 60 เดือน ก่อนเดือนที่ตาย",
        conditions:
          "• จ่ายเงินสมทบไม่น้อยกว่า 6 ใน 12 เดือน ก่อนเดือนที่ตาย\n• กรณีตายเพราะอุบัติเหตุ หากจ่ายเงินสมทบไม่ครบ 6 ใน 12 เดือน แต่มีการจ่ายเงินสมทบ 1 ใน 6 เดือน ก่อนเดือนที่ตาย มีสิทธิได้รับเงินค่าทำศพ",
      },
      เงินสงเคราะห์บุตร: {
        description: "เงินสงเคราะห์บุตรรายเดือน (เฉพาะทางเลือกที่ 3)",
        limit:
          "• ได้รับเงินสงเคราะห์บุตรรายเดือน คนละ 200 บาท คราวละไม่เกิน 2 คน\n• สำหรับบุตรอายุตั้งแต่แรกเกิดแต่ไม่เกิน 6 ปีบริบูรณ์",
        conditions:
          "จ่ายเงินสมทบไม่น้อยกว่า 24 ใน 36 เดือน ก่อนเดือนที่มีสิทธิได้รับประโยชน์ทดแทน\n\n*ขณะรับเงินสงเคราะห์บุตร ต้องจ่ายเงินสมทบทุกเดือน",
      },
    };

    const sectionTitle =
      selectedSection === "33"
        ? "มาตรา 33"
        : selectedSection === "39"
        ? "มาตรา 39"
        : selectedSection === "40-1"
        ? "มาตรา 40 ทางเลือกที่ 1"
        : selectedSection === "40-2"
        ? "มาตรา 40 ทางเลือกที่ 2"
        : selectedSection === "40-3"
        ? "มาตรา 40 ทางเลือกที่ 3"
        : selectedSection === "40"
        ? "มาตรา 40"
        : "";

    return (
      <Box bg="background.main" py={{ base: 16, md: 24 }}>
        <Container maxW="5xl">
          <VStack textAlign="center" mb={12} spacing={4}>
            <Heading as="h1" size="xl" mb={4}>
              นี้คือสิทธิประโยชน์หลักๆ ของคุณใน{sectionTitle}
            </Heading>
            <Text fontSize="lg" color="text.secondary">
              คลิกที่สิทธิประโยชน์แต่ละข้อเพื่อดูรายละเอียดเพิ่มเติม
            </Text>
          </VStack>

          <Box
            bg="background.card"
            borderWidth="1px"
            borderRadius="lg"
            borderColor="gray.200"
            boxShadow="md"
            p={{ base: 6, md: 8 }}
            mb={8}
          >
            <Heading
              as="h2"
              size="lg"
              fontWeight="bold"
              mb={6}
              textAlign="center"
            >
              คุณเคยใช้สิทธิไหนไปบ้างแล้ว?
            </Heading>

            <VStack spacing={4} align="stretch" mb={6}>
              {selectedSection &&
                benefits[selectedSection].map((benefit, index) => (
                  <Box key={index}>
                    <Flex
                      alignItems="flex-start"
                      gap={3}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={
                        expandedBenefit === benefit ? "primary.500" : "gray.200"
                      }
                      bg={expandedBenefit === benefit ? "primary.50" : "white"}
                      cursor="pointer"
                      onClick={() => toggleExpandedBenefit(benefit)}
                      transition="all 0.2s"
                      _hover={{ bg: "gray.50" }}
                    >
                      <Box pt={1}>
                        <Checkbox
                          size="lg"
                          colorScheme="primary"
                          isChecked={userData.usedBenefits.includes(benefit)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleUsedBenefit(benefit);
                          }}
                          borderColor="primary.400"
                          iconColor="white"
                          sx={{
                            "& .chakra-checkbox__control": {
                              borderWidth: "2px",
                              bg: "white",
                            },
                          }}
                        />
                      </Box>
                      <Box flex="1">
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text fontSize="lg" fontWeight="medium">
                            {benefit}
                          </Text>
                          <Icon
                            as={
                              expandedBenefit === benefit
                                ? FiChevronUp
                                : FiChevronDown
                            }
                            boxSize={5}
                            color="gray.500"
                          />
                        </Flex>

                        {/* Collapsible detail section */}
                        {expandedBenefit === benefit &&
                          benefitDetails[benefit] && (
                            <Box
                              mt={3}
                              pt={3}
                              borderTopWidth="1px"
                              borderColor="gray.200"
                            >
                              <Text mb={2}>
                                {benefitDetails[benefit].description}
                              </Text>

                              <Box bg="gray.50" p={3} borderRadius="md">
                                <Text fontWeight="medium" mb={1}>
                                  สิทธิประโยชน์ที่ได้รับ
                                </Text>
                                <Text mb={3} whiteSpace="pre-line">
                                  {benefitDetails[benefit].limit}
                                </Text>

                                <Text fontWeight="medium" mb={1}>
                                  เงื่อนไข
                                </Text>
                                <Text>
                                  {benefitDetails[benefit].conditions}
                                </Text>
                              </Box>
                            </Box>
                          )}
                      </Box>
                    </Flex>
                  </Box>
                ))}
            </VStack>

            {selectedSection && (
              <Box
                bg="subtle.50"
                p={4}
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="accent.500"
              >
                <Text fontWeight="medium">
                  คุณเคยใช้สิทธิไปแล้ว {userData.usedBenefits.length} จาก{" "}
                  {benefits[selectedSection].length} สิทธิประโยชน์
                </Text>
                {userData.usedBenefits.length === 0 && (
                  <Text fontSize="sm" mt={2}>
                    คุณยังไม่เคยใช้สิทธิใดๆ เลย
                    การใช้สิทธิประโยชน์จะช่วยให้คุณได้รับประโยชน์สูงสุดจากระบบประกันสังคม
                  </Text>
                )}
                {userData.usedBenefits.length > 0 &&
                  userData.usedBenefits.length <
                    benefits[selectedSection].length / 2 && (
                    <Text fontSize="sm" mt={2}>
                      คุณใช้สิทธิน้อยกว่าครึ่งหนึ่งของสิทธิประโยชน์ที่คุณมี
                      ลองพิจารณาใช้สิทธิอื่นๆ เพิ่มเติม
                    </Text>
                  )}
                {userData.usedBenefits.length >=
                  benefits[selectedSection].length / 2 && (
                  <Text fontSize="sm" mt={2}>
                    ดีมาก! คุณใช้สิทธิประโยชน์ได้คุ้มค่า
                    มีข้อเสนอแนะอะไรในการปรับปรุงสิทธิประโยชน์เหล่านี้หรือไม่?
                  </Text>
                )}
              </Box>
            )}
          </Box>

          <Flex gap={4} justifyContent="center">
            <Button variant="outline" onClick={() => navigateTo("selection")}>
              ย้อนกลับ
            </Button>
            <Button onClick={() => navigateTo("userInput")}>
              ดำเนินการต่อ
            </Button>
          </Flex>
        </Container>
      </Box>
    );
  };

  // User Input Section
  const renderUserInputSection = () => {
    // Calculate total contribution (if values exist)
    const calculateTotalContribution = () => {
      if (userData.yearsContributing && userData.monthlyContribution) {
        const years = parseFloat(userData.yearsContributing) || 0;
        const months = parseFloat(userData.monthsContributing || "0");
        const monthly = parseFloat(userData.monthlyContribution);
        if (!isNaN(years) && !isNaN(months) && !isNaN(monthly)) {
          const totalMonths = years * 12 + months;
          return (totalMonths * monthly).toLocaleString("th-TH");
        }
      }
      return "0";
    };

    // Get the relevant benefits for the selected section
    const getSectionBenefits = () => {
      const benefits: Record<Exclude<SectionType, null>, string[]> = {
        "33": [
          "กรณีเจ็บป่วย",
          "กรณีคลอดบุตร",
          "กรณีทุพพลภาพ",
          "กรณีเสียชีวิต",
          "กรณีชราภาพ",
          "กรณีว่างงาน",
          "กรณีสงเคราะห์บุตร",
        ],
        "39": [
          "กรณีเจ็บป่วย",
          "กรณีคลอดบุตร",
          "กรณีทุพพลภาพ",
          "กรณีเสียชีวิต",
          "กรณีชราภาพ",
          "กรณีสงเคราะห์บุตร",
        ],
        "40": [
          "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
          "กรณีทุพพลภาพ",
          "กรณีเสียชีวิต",
          "เงินบำเหน็จชราภาพ",
        ],
        "40-1": [
          "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
          "เงินทดแทนกรณีทุพพลภาพ",
          "เงินค่าทำศพ",
        ],
        "40-2": [
          "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
          "เงินทดแทนกรณีทุพพลภาพ",
          "เงินค่าทำศพ",
          "เงินบำเหน็จชราภาพ",
        ],
        "40-3": [
          "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
          "เงินทดแทนกรณีทุพพลภาพ",
          "เงินค่าทำศพ",
          "เงินบำเหน็จชราภาพ",
          "เงินสงเคราะห์บุตร",
        ],
        notRegYet: [],
      };

      return selectedSection
        ? benefits[selectedSection as Exclude<SectionType, null>]
        : [];
    };

    // Handle radio button change for section 40
    const handleRadioChange = (value: string) => {
      updateUserData({ monthlyContribution: value });
    };

    // Add new calculation function for section 39
    const calculateTotalContributionSection39 = () => {
      if (selectedSection === "39") {
        const years33 = parseFloat(userData.yearsSection33 || "0");
        const months33 = parseFloat(userData.monthsSection33 || "0");
        const monthly33 = parseFloat(userData.monthlySection33 || "0");
        const years39 = parseFloat(userData.yearsSection39 || "0");
        const months39 = parseFloat(userData.monthsSection39 || "0");
        const monthly39 = 432; // Fixed rate for section 39

        if (
          !isNaN(years33) &&
          !isNaN(months33) &&
          !isNaN(monthly33) &&
          !isNaN(years39) &&
          !isNaN(months39)
        ) {
          const totalMonths33 = years33 * 12 + months33;
          const totalMonths39 = years39 * 12 + months39;
          const total33 = totalMonths33 * monthly33;
          const total39 = totalMonths39 * monthly39;
          return (total33 + total39).toLocaleString("th-TH");
        }
      }
      return "0";
    };

    return (
      <Box bg="background.main" py={{ base: 16, md: 24 }}>
        <Container maxW="3xl">
          <VStack textAlign="center" mb={8} spacing={4}>
            <Heading as="h1" size="xl" mb={4}>
              คุณใช้สิทธิไป {userData.usedBenefits.length} อย่าง
            </Heading>
            <Text variant="subtitle">
              คุณจ่ายเงินมาแล้วกี่ปี จ่ายไปเท่าไรแล้ว รู้หรือเปล่า?
            </Text>
          </VStack>

          {/* Benefits usage summary */}
          {userData.usedBenefits.length > 0 && (
            <Box
              bg="background.card"
              borderWidth="1px"
              borderRadius="lg"
              borderColor="gray.200"
              boxShadow="md"
              p={{ base: 6, md: 8 }}
              mb={6}
            >
              <Heading as="h3" size="md" mb={4}>
                สิทธิที่คุณเคยใช้:
              </Heading>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={3}
              >
                {userData.usedBenefits.map((benefit, index) => (
                  <Flex key={index} alignItems="center">
                    <Box
                      bg="accent.50"
                      color="accent.500"
                      borderRadius="full"
                      p={1}
                      mr={2}
                      display="flex"
                    >
                      <Icon viewBox="0 0 24 24" boxSize={4}>
                        <path
                          fill="currentColor"
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                        />
                      </Icon>
                    </Box>
                    <Text>{benefit}</Text>
                  </Flex>
                ))}
              </Grid>

              {userData.usedBenefits.length < getSectionBenefits().length && (
                <Box mt={4} pt={4} borderTopWidth="1px" borderColor="gray.200">
                  <Heading as="h3" size="md" mb={2}>
                    สิทธิที่คุณยังไม่เคยใช้:
                  </Heading>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={3}
                  >
                    {getSectionBenefits()
                      .filter(
                        (benefit: string) =>
                          !userData.usedBenefits.includes(benefit)
                      )
                      .map((benefit: string, index: number) => (
                        <Flex key={index} alignItems="center">
                          <Box
                            bg="gray.100"
                            color="gray.400"
                            borderRadius="full"
                            p={1}
                            mr={2}
                            display="flex"
                          >
                            <Icon viewBox="0 0 24 24" boxSize={4}>
                              <path
                                fill="currentColor"
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                              />
                            </Icon>
                          </Box>
                          <Text color="gray.500">{benefit}</Text>
                        </Flex>
                      ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}

          <Box
            bg="background.card"
            borderWidth="1px"
            borderRadius="lg"
            borderColor="gray.200"
            boxShadow="md"
            p={{ base: 6, md: 8 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigateTo("suggestBenefits");
              }}
            >
              <FormControl mb={4}>
                <FormLabel>อายุ</FormLabel>
                <Input
                  type="number"
                  value={userData.age}
                  onChange={(e) => updateUserData({ age: e.target.value })}
                  required
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>อาชีพ</FormLabel>
                <Input
                  type="text"
                  value={userData.occupation}
                  onChange={(e) =>
                    updateUserData({ occupation: e.target.value })
                  }
                  required
                />
              </FormControl>

              {selectedSection === "39" ? (
                <>
                  <FormControl mb={4}>
                    <FormLabel>ระยะเวลาที่จ่ายในมาตรา 33</FormLabel>
                    <Flex gap={4} mb={4}>
                      <Box flex="1">
                        <Input
                          type="number"
                          placeholder="จำนวนปี"
                          value={userData.yearsSection33}
                          onChange={(e) =>
                            updateUserData({ yearsSection33: e.target.value })
                          }
                          required
                        />
                      </Box>
                      <Box flex="1">
                        <Input
                          type="number"
                          placeholder="จำนวนเดือน (ไม่มีให้ใส่ 0)"
                          value={userData.monthsSection33 || ""}
                          onChange={(e) =>
                            updateUserData({ monthsSection33: e.target.value })
                          }
                          required
                        />
                      </Box>
                    </Flex>
                    <Input
                      type="number"
                      placeholder="จำนวนเงินต่อเดือน"
                      value={userData.monthlySection33}
                      onChange={(e) =>
                        updateUserData({ monthlySection33: e.target.value })
                      }
                      required
                    />
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>ระยะเวลาที่จ่ายในมาตรา 39</FormLabel>
                    <Flex gap={4} mb={4}>
                      <Box flex="1">
                        <Input
                          type="number"
                          placeholder="จำนวนปี"
                          value={userData.yearsSection39}
                          onChange={(e) =>
                            updateUserData({ yearsSection39: e.target.value })
                          }
                          required
                        />
                      </Box>
                      <Box flex="1">
                        <Input
                          type="number"
                          placeholder="จำนวนเดือน (ไม่มีให้ใส่ 0)"
                          value={userData.monthsSection39 || ""}
                          onChange={(e) =>
                            updateUserData({ monthsSection39: e.target.value })
                          }
                          required
                        />
                      </Box>
                    </Flex>
                    <Input type="number" value="432" isReadOnly bg="gray.50" />
                    <Text fontSize="sm" color="text.muted" mt={1}>
                      อัตราตายตัว 432 บาทต่อเดือน
                    </Text>
                  </FormControl>
                </>
              ) : selectedSection === "40" ||
                selectedSection === "40-1" ||
                selectedSection === "40-2" ||
                selectedSection === "40-3" ? (
                <>
                  <FormControl mb={4}>
                    <FormLabel>ระยะเวลาที่จ่ายเงินสมทบในมาตรา 40</FormLabel>
                    <Flex gap={4}>
                      <Box flex="1">
                        <Input
                          type="number"
                          placeholder="จำนวนปี"
                          value={userData.yearsContributing}
                          onChange={(e) =>
                            updateUserData({
                              yearsContributing: e.target.value,
                            })
                          }
                          required
                        />
                      </Box>
                      <Box flex="1">
                        <Input
                          type="number"
                          placeholder="จำนวนเดือน (ไม่มีให้ใส่ 0)"
                          value={userData.monthsContributing || ""}
                          onChange={(e) =>
                            updateUserData({
                              monthsContributing: e.target.value,
                            })
                          }
                          required
                        />
                      </Box>
                    </Flex>
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>ทางเลือกที่คุณใช้ในมาตรา 40</FormLabel>
                    <RadioGroup
                      value={userData.monthlyContribution || "100"}
                      onChange={handleRadioChange}
                    >
                      <VStack align="flex-start" spacing={4}>
                        <Radio value="70" colorScheme="primary">
                          <Box>
                            <Text fontWeight="medium">
                              ทางเลือกที่ 1 (จ่าย 70 บาท/เดือน)
                            </Text>
                            <Text fontSize="sm" color="text.muted">
                              • ประสบอันตราย/เจ็บป่วย • ทุพพลภาพ • ตาย
                            </Text>
                          </Box>
                        </Radio>

                        <Radio value="100" colorScheme="primary">
                          <Box>
                            <Text fontWeight="medium">
                              ทางเลือกที่ 2 (จ่าย 100 บาท/เดือน)
                            </Text>
                            <Text fontSize="sm" color="text.muted">
                              • สิทธิประโยชน์ทั้งหมดจากทางเลือกที่ 1 •
                              บำเหน็จชราภาพ
                            </Text>
                          </Box>
                        </Radio>

                        <Radio value="300" colorScheme="primary">
                          <Box>
                            <Text fontWeight="medium">
                              ทางเลือกที่ 3 (จ่าย 300 บาท/เดือน)
                            </Text>
                            <Text fontSize="sm" color="text.muted">
                              • สิทธิประโยชน์ทั้งหมดจากทางเลือกที่ 2 •
                              สงเคราะห์บุตร
                            </Text>
                          </Box>
                        </Radio>
                      </VStack>
                    </RadioGroup>
                  </FormControl>
                </>
              ) : (
                <FormControl mb={4}>
                  <FormLabel>ระยะเวลาที่จ่ายเงินเข้าประกันสังคม</FormLabel>
                  <Flex gap={4}>
                    <Box flex="1">
                      <Input
                        type="number"
                        placeholder="จำนวนปี"
                        value={userData.yearsContributing}
                        onChange={(e) =>
                          updateUserData({ yearsContributing: e.target.value })
                        }
                        required
                      />
                    </Box>
                    <Box flex="1">
                      <Input
                        type="number"
                        placeholder="จำนวนเดือน (ไม่มีให้ใส่ 0)"
                        value={userData.monthsContributing || ""}
                        onChange={(e) =>
                          updateUserData({ monthsContributing: e.target.value })
                        }
                        required
                      />
                    </Box>
                  </Flex>
                </FormControl>
              )}

              {/* Show calculation of total contribution */}
              {selectedSection === "39" ? (
                <Box
                  bg="subtle.50"
                  p={4}
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="accent.500"
                  mb={6}
                  mt={4}
                >
                  <Text fontWeight="medium">
                    คุณจ่ายเงินเข้าประกันสังคมไปแล้วทั้งหมดประมาณ{" "}
                    {calculateTotalContributionSection39()} บาท
                  </Text>
                  <Text fontSize="sm" mt={2}>
                    คำนวณจาก:
                    <br />• มาตรา 33: {userData.yearsSection33} ปี{" "}
                    {userData.monthsSection33
                      ? `และ ${userData.monthsSection33} เดือน`
                      : ""}{" "}
                    ×{" "}
                    {parseFloat(
                      userData.monthlySection33 || "0"
                    ).toLocaleString("th-TH")}{" "}
                    บาท
                    <br />• มาตรา 39: {userData.yearsSection39} ปี{" "}
                    {userData.monthsSection39
                      ? `และ ${userData.monthsSection39} เดือน`
                      : ""}{" "}
                    × 432 บาท
                  </Text>
                </Box>
              ) : (
                <Box
                  bg="subtle.50"
                  p={4}
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="accent.500"
                  mb={6}
                  mt={4}
                >
                  <Text fontWeight="medium">
                    คุณจ่ายเงินเข้าประกันสังคมไปแล้วทั้งหมดประมาณ{" "}
                    {calculateTotalContribution()} บาท
                  </Text>
                  <Text fontSize="sm" mt={2}>
                    คำนวณจาก {userData.yearsContributing} ปี{" "}
                    {userData.monthsContributing
                      ? `และ ${userData.monthsContributing} เดือน`
                      : ""}{" "}
                    ×{" "}
                    {parseFloat(userData.monthlyContribution).toLocaleString(
                      "th-TH"
                    )}{" "}
                    บาท
                  </Text>
                </Box>
              )}

              <Flex gap={4} justify="flex-end" mt={8}>
                <Button
                  variant="outline"
                  onClick={() => navigateTo("currentBenefits")}
                >
                  ย้อนกลับ
                </Button>
                <Button type="submit">ดำเนินการต่อ</Button>
              </Flex>
            </form>
          </Box>
        </Container>
      </Box>
    );
  };

  // Suggest Benefits Section
  const renderSuggestBenefitsSection = () => {
    return (
      <Box bg="background.main" py={{ base: 16, md: 24 }}>
        <Container maxW="3xl">
          <VStack textAlign="center" mb={8} spacing={4}>
            {selectedSection === "notRegYet" ? (
              <Heading as="h1" size="xl" mb={4}>
                ประกันสังคมที่คุณอยากเห็น
              </Heading>
            ) : (
              <Heading as="h1" size="xl" mb={4}>
                สำหรับคุณ &ldquo;ประกันสังคม&rdquo; ควรจะเป็นอะไร ?
              </Heading>
            )}
            <Text variant="subtitle">
              {selectedSection === "notRegYet"
                ? "แม้คุณยังไม่ได้ใช้ระบบประกันสังคม แต่ความคิดเห็นของคุณมีค่า"
                : "เลือกสิทธิประโยชน์ที่คุณต้องการให้มีหรือปรับปรุงในระบบประกันสังคม"}
            </Text>
          </VStack>

          <Box
            bg="background.card"
            borderWidth="1px"
            borderRadius="lg"
            borderColor="gray.200"
            boxShadow="md"
            p={{ base: 6, md: 8 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitFeedback();
              }}
            >
              <VStack spacing={4} mb={6} align="stretch">
                <Checkbox
                  id="healthcare"
                  size="lg"
                  colorScheme="primary"
                  isChecked={suggestedBenefits.healthcare}
                  onChange={(e) =>
                    updateSuggestedBenefits("healthcare", e.target.checked)
                  }
                >
                  <Text fontSize="lg" ml={2}>
                    สิทธิรักษาพยาบาลที่ครอบคลุมและทั่วถึง
                  </Text>
                </Checkbox>

                <Checkbox
                  id="retirement"
                  size="lg"
                  colorScheme="primary"
                  isChecked={suggestedBenefits.retirement}
                  onChange={(e) =>
                    updateSuggestedBenefits("retirement", e.target.checked)
                  }
                >
                  <Text fontSize="lg" ml={2}>
                    กองทุนฟื้นฟูดูแลคนทำงานในทุกช่วงวิกฤติ
                  </Text>
                </Checkbox>

                <Checkbox
                  id="unemployment"
                  size="lg"
                  colorScheme="primary"
                  isChecked={suggestedBenefits.unemployment}
                  onChange={(e) =>
                    updateSuggestedBenefits("unemployment", e.target.checked)
                  }
                >
                  <Text fontSize="lg" ml={2}>
                    เงินบำนาญที่เพียงต่อการดำเนินชีวิตในวัยเกษียณ
                  </Text>
                </Checkbox>

                <Checkbox
                  id="disability"
                  size="lg"
                  colorScheme="primary"
                  isChecked={suggestedBenefits.disability}
                  onChange={(e) =>
                    updateSuggestedBenefits("disability", e.target.checked)
                  }
                >
                  <Text fontSize="lg" ml={2}>
                    รัฐสวัสดิการที่ดูแลทุกช่วงวัย
                  </Text>
                </Checkbox>

                {/* New Heading */}
                <Text fontSize="lg" fontWeight="bold" mt={4}>
                  หรือคุณคิดว่าประกันสังคมควรจะเป็นอะไร
                </Text>

                {/* New Textarea for user input */}
                <Textarea
                  placeholder="โปรดระบุความคิดเห็นของคุณเกี่ยวกับประกันสังคม"
                  size="lg"
                  mt={2}
                  onChange={(e) =>
                    updateSuggestedBenefits("userIdea", e.target.value)
                  }
                />
              </VStack>

              <FormControl mb={6}>
                <FormLabel>
                  {selectedSection === null
                    ? "คุณอยากเห็นระบบประกันสังคมเป็นอย่างไร?"
                    : "สิทธิประโยชน์ของประกันสังคมที่คุณต้องการ ?"}
                </FormLabel>
                <Textarea
                  h="40"
                  placeholder={
                    selectedSection === null
                      ? "แชร์ความคิดเห็นของคุณเกี่ยวกับระบบประกันสังคมที่อยากเห็น..."
                      : "ระบุสิทธิประโยชน์ที่คุณต้องการเพิ่มเติม..."
                  }
                  value={suggestedBenefits.other}
                  onChange={(e) =>
                    updateSuggestedBenefits("other", e.target.value)
                  }
                />
              </FormControl>

              <Flex gap={4} justify="flex-end" mt={8}>
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedSection === null
                      ? navigateTo("selection")
                      : navigateTo("userInput")
                  }
                  isDisabled={isSubmitting}
                >
                  ย้อนกลับ
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  ส่งข้อเสนอแนะ
                </Button>
              </Flex>
            </form>
          </Box>
        </Container>
      </Box>
    );
  };

  // End Section with thanks and social sharing
  const renderEndSection = () => {
    return (
      <Box bg="background.main" py={{ base: 16, md: 24 }}>
        <Container maxW="3xl">
          <VStack textAlign="center" mb={12} spacing={6}>
            <Box mb={6} display="inline-block">
              <Icon
                viewBox="0 0 24 24"
                boxSize={24}
                color="accent.500"
                mx="auto"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </Icon>
            </Box>

            <Heading as="h1" size="xl" fontWeight="bold" mb={4}>
              ขอบคุณสำหรับความคิดเห็นของคุณ!
            </Heading>
            <Text variant="subtitle" fontSize="xl" mb={8}>
              เสียงของคุณมีความสำคัญในการพัฒนาระบบประกันสังคมให้ตอบโจทย์คนรุ่นใหม่มากขึ้น
            </Text>

            <Box mt={8}>
              <Button onClick={() => navigateTo("home")}>
                กลับสู่หน้าหลัก
              </Button>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  };

  // New render function for section 40 options
  const renderSection40OptionsSection = () => {
    return (
      <Box p={4} maxW="1200px" mx="auto">
        <Heading as="h1" size="xl" textAlign="center" mb={4}>
          เลือกทางเลือกในการจ่ายเงินสมทบตามมาตรา 40
        </Heading>
        <Text textAlign="center" mb={6}>
          มาตรา 40 มีทางเลือกในการจ่ายเงินสมทบและรับสิทธิประโยชน์แตกต่างกัน 3
          แบบ กรุณาเลือกแบบที่ต้องการ:
        </Text>

        <SimpleGrid columns={[1, null, 3]} spacing={4}>
          <ChakraCard
            title="ทางเลือกที่ 1"
            description={
              <>
                <Text fontWeight="bold" mb={2}>
                  จ่ายเงินสมทบ 70 บาท/เดือน
                </Text>
                <Text mb={3}>คุณจะได้รับสิทธิประโยชน์ 3 กรณี:</Text>
                <VStack spacing={2} align="stretch">
                  <CheckedListItem text="เงินทดแทนการขาดรายได้ กรณีประสบอันตรายหรือเจ็บป่วย" />
                  <CheckedListItem text="เงินทดแทนการขาดรายได้ กรณีทุพพลภาพ" />
                  <CheckedListItem text="เงินค่าทำศพ กรณีเสียชีวิต หรือเงินสงเคราะห์กรณีตาย" />
                </VStack>
              </>
            }
            benefits={[]}
            gradientFrom="#f3762a"
            gradientTo="#f3762a"
            onClick={() => handleSection40OptionSelect("40-1")}
          />

          <ChakraCard
            title="ทางเลือกที่ 2"
            description={
              <>
                <Text fontWeight="bold" mb={2}>
                  จ่ายเงินสมทบ 100 บาท/เดือน
                </Text>
                <Text mb={3}>คุณจะได้รับสิทธิประโยชน์ 4 กรณี:</Text>
                <VStack spacing={2} align="stretch">
                  <CheckedListItem text="เงินทดแทนการขาดรายได้ กรณีประสบอันตรายหรือเจ็บป่วย" />
                  <CheckedListItem text="เงินทดแทนการขาดรายได้ กรณีทุพพลภาพ" />
                  <CheckedListItem text="เงินค่าทำศพ กรณีเสียชีวิต หรือเงินสงเคราะห์กรณีตาย" />
                  <CheckedListItem text="เงินบำเหน็จชราภาพ" />
                </VStack>
              </>
            }
            benefits={[]}
            gradientFrom="#f3762a"
            gradientTo="#f3762a"
            onClick={() => handleSection40OptionSelect("40-2")}
          />

          <ChakraCard
            title="ทางเลือกที่ 3"
            description={
              <>
                <Text fontWeight="bold" mb={2}>
                  จ่ายเงินสมทบ 300 บาท/เดือน
                </Text>
                <Text mb={3}>คุณจะได้รับสิทธิประโยชน์ 5 กรณี:</Text>
                <VStack spacing={2} align="stretch">
                  <CheckedListItem text="เงินทดแทนการขาดรายได้ กรณีประสบอันตรายหรือเจ็บป่วย" />
                  <CheckedListItem text="เงินทดแทนการขาดรายได้ กรณีทุพพลภาพ" />
                  <CheckedListItem text="เงินค่าทำศพ กรณีเสียชีวิต หรือเงินสงเคราะห์กรณีตาย" />
                  <CheckedListItem text="เงินบำเหน็จชราภาพ" />
                  <CheckedListItem text="เงินสงเคราะห์บุตร" />
                </VStack>
              </>
            }
            benefits={[]}
            gradientFrom="#f3762a"
            gradientTo="#f3762a"
            onClick={() => handleSection40OptionSelect("40-3")}
          />
        </SimpleGrid>
      </Box>
    );
  };

  // Section Selection
  const renderSelectionSection = () => {
    // Handler for people who haven't registered yet
    const handleNotRegisteredSelect = () => {
      // Set "notRegYet" as selection type and navigate to suggestions
      setSelectedSection("notRegYet");
      navigateTo("suggestBenefits");
    };

    return (
      <Box bg="background.main" py={{ base: 16, md: 24 }}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            <Heading as="h1" size="xl" textAlign="center" mb={8}>
              คุณอยู่ในประกันสังคมมาตราไหน ?
            </Heading>
            <Flex gap={4} mb={4}>
              <a
                href="https://www.senate.go.th/view/386/News/SenateMagazine/287/TH-TH"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                อ่านข้อมูลเพิ่ม (วุฒิสภา)
              </a>
              <a
                href="https://policywatch.thaipbs.or.th/article/life-21"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                อ่านข้อมูลเพิ่ม (ThaiPBS)
              </a>
            </Flex>
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={8}
              w="full"
            >
              <ChakraCard
                title={
                  <VStack spacing={0} align="start">
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      มาตรา 33
                    </Text>
                    <Text fontSize="sm" color="white">
                      (ผู้ประกันตนภาคบังคับ)
                    </Text>
                  </VStack>
                }
                description="ลูกจ้าง พนักงานเอกชนทั่วไป "
                icon={<FiUser size={24} />}
                benefits={[
                  "ได้รับความคุ้มครอง 7 กรณี",
                  "สิทธิในการทำทันตกรรม ไม่เกิน 900 บาท/ปี ",
                  "ตรวจสุขภาพประจำปี",
                  "ใช้ลดหย่อนภาษี",
                ]}
                gradientFrom="#3d3a7e"
                gradientTo="#3d3a7e"
                onClick={() => handleSectionTypeSelect("33")}
              />
              <ChakraCard
                title={
                  <VStack spacing={0} align="start">
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      มาตรา 39
                    </Text>
                    <Text fontSize="sm" color="white">
                      (ผู้ประกันตนภาคสมัครใจ)
                    </Text>
                  </VStack>
                }
                description="เคยเป็นผู้ประกันตนในมาตรา 33 มาก่อน"
                icon={<FiDollarSign size={24} />}
                benefits={[
                  "ได้รับความคุ้มครอง 6 กรณี (ยกเว้นกรณีว่างงาน)",
                  "ใช้ลดหย่อนภาษี",
                ]}
                gradientFrom="#e0c927"
                gradientTo="#e0c927"
                onClick={() => handleSectionTypeSelect("39")}
              />
              <ChakraCard
                title={
                  <VStack spacing={0} align="start">
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      มาตรา 40
                    </Text>
                    <Text fontSize="sm" color="white">
                      (ผู้ประกันตนนอกระบบ)
                    </Text>
                  </VStack>
                }
                description="ประกอบอาชีพอิสระ หรือแรงงานนอกระบบ"
                icon={<FiHeart size={24} />}
                benefits={[
                  "มี 3 ทางเลือกชุดสิทธิประโยชน์ เลือกจ่ายเงินสมทบได้",
                  "ออมเพิ่มกรณีชราภาพได้",
                  "ได้เงินชราภาพเมื่ออายุ 60 ปีบริบูรณ์ (เงินบำเหน็จ)",
                  "ใช้ลดหย่อนภาษี",
                ]}
                gradientFrom="#f3762a"
                gradientTo="#f3762a"
                onClick={() => handleSectionTypeSelect("40")}
              />
              <ChakraCard
                title={
                  <VStack spacing={0} align="start">
                    <Text fontSize="lg" color="white" fontWeight="bold">
                      ยังไม่ได้เข้าร่วม
                    </Text>
                    <Text fontSize="sm" color="white">
                      ประกันสังคม
                    </Text>
                  </VStack>
                }
                description="แต่อยากแสดงความคิดเห็นเพื่อพัฒนาประกันสังคม"
                icon={<FiMessageSquare size={24} />}
                benefits={[]}
                gradientFrom="#4A90E2"
                gradientTo="#4A90E2"
                onClick={handleNotRegisteredSelect}
              />
            </Grid>
            <Box mt={4}>
              <ChakraButton
                text="กลับไปหน้าหลัก"
                buttonType="outline"
                onClick={() => navigateTo("home")}
              />
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  };

  return (
    <>
      <Box as="main" pb={{ base: 8, md: 10 }}>
        {renderSection()}
      </Box>
      <Footer />
    </>
  );
}
