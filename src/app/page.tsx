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
  FiTarget,
  FiAlertTriangle,
  FiInfo,
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
  Tooltip,
} from "@chakra-ui/react";
import { saveFeedback } from "@/services/feedbackService";
import { motion, AnimatePresence } from "framer-motion";

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
  note?: string;
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
                  <br /> ทุกเดือน — แต่ไม่รู้{" "}
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
          "• เข้ารักษาในสถานพยาบาลที่ที่อยู่ในเครือข่ายของโรงพยาบาลตามสิทธิฯ โดยไม่ต้องเสียค่าใช้จ่าย\n• กรณีต้องหยุดงานพักรักษาตัวตามคำสั่งแพทย์  ได้รับเงินทดแทนการขาดรายได้ 50% ของค่าจ้าง ครั้งละไม่เกิน 90 วัน และไม่เกิน 180 วันต่อปี เว้นแต่ป่วยด้วยโรคเรื้อรังไม่เกิน 365 วันต่อปี\n• กรณีประสบอันตรายหรือเจ็บป่วยฉุกเฉินวิกฤต ผู้ประกันตนไม่ต้องสำรองจ่าย สำนักงานฯ จะรับผิดชอบค่าบริการทางการแพทย์จนพ้นภาวะวิกฤตภายใน 72 ชั่วโมง (นับรวมวันหยุดราชการ) ให้แก่สถานพยาบาลเอกชนที่รักษา\n• ถอนฟัน อุดฟัน ขูดหินปูน และผ่าตัดฟันคุด ได้ไม่เกิน 900 บาทต่อปี หากรับบริการในสถานพยาบาลที่ทำความตกลงกับสำนักงานฯ ไม่ต้องสำรองจ่าย  ผู้ประกันตนจ่ายค่าบริการทางการแพทย์เฉพาะส่วนเกินจากสิทธิที่ได้รับ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 3 เดือน ภายในระยะเวลา 15 เดือน ก่อนวันรับบริการทางการแพทย์",
        note: "ค่าบริการทางการแพทย์ จ่ายตามหลักเกณฑ์และอัตราที่คณะกรรมการการแพทย์กำหนด",
      },
      กรณีคลอดบุตร: {
        description:
          "เงินค่าคลอดบุตร ค่าตรวจและฝากครรภ์ และเงินสงเคราะห์การหยุดงานเพื่อการคลอดบุตร",
        limit:
          "• ค่าคลอดบุตรเหมาจ่าย 15,000 บาทต่อครั้ง (ไม่จำกัดจำนวนครั้ง)\n• เงินสงเคราะห์การหยุดงานสำหรับผู้ประกันตนหญิง 50% ของค่าจ้าง เป็นเวลา 90 วัน ไม่เกิน 2 ครั้ง\n• กรณีสามีและภรรยาเป็นผู้ประกันตนทั้งคู่ให้ใช้สิทธิของฝ่ายใดฝ่ายหนึ่ง \n• ค่าตรวจและรับฝากครรภ์ เท่าที่จ่ายจริง จำนวน 5 ครั้ง ไม่เกิน 1,500 บาท ตามหลักเกณฑ์และอัตราที่คณะกรรมการการแพทย์กำหนด ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 5 เดือน ภายในระยะเวลา 15 เดือน ก่อนเดือนที่คลอดบุตร",
        note: "ค่าบริการทางการแพทย์ จ่ายตามหลักเกณฑ์และอัตราที่คณะกรรมการการแพทย์กำหนด",
      },
      กรณีทุพพลภาพ: {
        description: "เงินทดแทนการขาดรายได้ และค่ารักษาพยาบาลทางการแพทย์",
        limit:
          "• ทุพพลภาพรุนแรง ได้รับเงินทดแทนการขาดรายได้ในอัตรา 50% ของค่าจ้างเป็นรายเดือน ตลอดชีวิต\n• ทุพพลภาพไม่รุนแรง ได้รับเงินทดแทนการขาดรายได้ ตามหลักเกณฑ์และระยะเวลาตามประกาศฯ กำหนด\n• ค่าบริการทางการแพทย์ โรงพยาบาลรัฐ จ่ายเท่าที่จ่ายจริงตามความจำเป็น\n• ค่าบริการทางการแพทย์ โรงพยาบาลเอกชน ผู้ป่วยนอกจ่ายตามจริงไม่เกิน 2,000 บาทต่อเดือน  ผู้ป่วยในจ่ายตามจริงไม่เกิน 4,000 บาทต่อเดือน ส่วนค่ารถพยาบาลไม่เกิน 500 บาทต่อเดือน\n• เมื่อเสียชีวิตจากการทุพพลภาพ จะได้สิทธิเช่นเดียวกับกรณีเสียชีวิต ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 3 เดือน ภายในระยะเวลา 15 เดือน ก่อนทุพพลภาพ",
        note: "ค่าบริการทางการแพทย์ จ่ายตามหลักเกณฑ์และอัตราที่คณะกรรมการการแพทย์กำหนด",
      },
      กรณีเสียชีวิต: {
        description: "เงินช่วยเหลือค่าทำศพและเงินสงเคราะห์ให้แก่ทายาท",
        limit:
          "**ค่าทำศพ**\n • 50,000 บาท โดยจ่ายให้แก่ผู้จัดการศพ\n\n**ค่าทำศพ**\n  •จ่ายเงินสมทบ 36 เดือน (3 ปี) แต่ไม่ถึง 120 เดือน (10 ปี) ได้รับเงินสงเคราะห์เท่ากับค่าจ้างเฉลี่ย 2 เดือน\n• จ่ายเงินสมทบ 120 เดือนขึ้นไป ได้รับเงินสงเคราะห์เท่ากับค่าจ้างเฉลี่ย 6 เดือน ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 1 เดือน ภายในระยะเวลา 6 เดือน ก่อนเสียชีวิต",
      },
      กรณีชราภาพ: {
        description:
          "เงินบำเน็จ (จ่ายครั้งเดียว) หรือเงินบำนาญ (จ่ายรายเดือนตลอดชีวิต)",
        limit:
          "**เงินบำเหน็จชราภาพ**\n• จ่ายเงินสมทบไม่ถึง 12 เดือน ได้รับเงินเท่ากับเงินสมทบกรณีชราภาพที่ผู้ประกันตนจ่าย\n• จ่ายเงินสมทบ 12 เดือน แต่ไม่ถึง 180 เดือน ได้รับเงินเท่ากับจำนวนเงินสมทบกรณีชราภาพที่ผู้ประกันตนและนายจ้างจ่าย\n\n**เงินบำนาญชราภาพ**\n• จ่ายเงินสมทบครบ 180 เดือน (15 ปี) จะได้รับบำนาญชราภาพ 20% ของค่าจ้างเฉลี่ย 60 เดือน (5 ปี) สุดท้าย\n• จ่ายเงินสมทบเกิน 180 เดือน จะได้รับเพิ่ม 1.5% ต่อระยะเวลาการจ่ายเงินสมทบครบทุก 12 เดือน",
        conditions: "มีอายุครบ 55 ปีบริบูรณ์ และสิ้นสุดความเป็นผู้ประกันตน",
      },
      กรณีว่างงาน: {
        description:
          "เงินทดแทนการขาดรายได้กรณีถูกเลิกจ้าง ลาออกหรือสิ้นสุดสัญญาจ้าง และว่างงานจากเหตุสุดวิสัย",
        limit:
          "• กรณีถูกเลิกจ้าง ได้เงิน 50% ของค่าจ้าง (ไม่เกินเดือนละ 15,000 บาท) ไม่เกิน 180 วัน/ปี\n• กรณีลาออกหรือสิ้นสุดสัญญาจ้างงาน ได้เงิน 30% ของค่าจ้าง (ไม่เกินเดือนละ 15,000 บาท) ไม่เกิน 90 วัน/ปี\n• กรณีว่างงานจากเหตุภัยพิบัติ  ได้เงิน 50% ของค่าจ้าง (ไม่เกินเดือนละ 15,000 บาท) ไม่เกิน 180 วัน/ปี\n• กรณีว่างงานจากการระบาดของโรคติดต่อ  ได้เงิน 50% ของค่าจ้าง (ไม่เกินเดือนละ 15,000 บาท) ไม่เกิน 90 วัน/ปี ",
        conditions:
          "จ่ายเงินสมทบมาแล้วไม่น้อยกว่า 6 เดือน ภายในระยะเวลา 15 เดือนก่อนการว่างงาน และต้องขึ้นทะเบียนในเว็บไซต์ของกรมการจัดหางาน ",
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
          "เมื่อผู้ประกันตนได้รับอันตรายหรือเจ็บป่วยเนื่องจากการทำงาน มีสิทธิได้รับเงินทดแทนการขาดรายได้",
        limit:
          "• เงินทดแทนการขาดรายได้: 50% ของค่าจ้างเฉลี่ย เป็นระยะเวลาไม่เกิน 90 วัน\n• หากต้องหยุดงานเกิน 90 วัน รับไม่เกิน 180 บาท/วัน เป็นระยะเวลาไม่เกิน 90 วัน",
        conditions:
          "จ่ายเงินสมทบไม่น้อยกว่า 3 ใน 4 เดือน ก่อนเดือนที่ประสบอันตรายหรือเจ็บป่วย",
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
        description:
          "ทางเลือกที่ 3 ได้รับเงินสงเคราะห์บุตรรายเดือน คนละ 200 บาท คราวละไม่เกิน 2 คน บุตรอายุตั้งแต่แรกเกิดแต่ไม่เกิน 6 ปี บริบูรณ์",
        limit:
          "ได้รับเงินสงเคราะห์บุตรรายเดือน คนละ 200 บาท คราวละไม่เกิน 2 คน สำหรับบุตรอายุตั้งแต่แรกเกิดแต่ไม่เกิน 6 ปีบริบูรณ์",
        conditions:
          "จ่ายเงินสมทบไม่น้อยกว่า 24 ใน 36 เดือน ก่อนเดือนที่มีสิทธิได้รับประโยชน์ทดแทน\n• ขณะรับเงินสงเคราะห์บุตร ต้องจ่ายเงินสมทบทุกเดือน",
      },
      เบี้ยยังชีพผู้สูงอายุ: {
        description:
          "เงินช่วยเหลือเพื่อการยังชีพแก่ผู้สูงอายุในประเทศไทย จ่ายโดยรัฐบาลผ่านองค์กรปกครองส่วนท้องถิ่น",
        limit:
          "• อายุ 60-69 ปี ได้รับเดือนละ 600 บาท\n• อายุ 70-79 ปี ได้รับเดือนละ 700 บาท\n• อายุ 80-89 ปี ได้รับเดือนละ 800 บาท\n• อายุ 90 ปีขึ้นไป ได้รับเดือนละ 1,000 บาท",
        conditions:
          "• มีสัญชาติไทย\n• อายุ 60 ปีบริบูรณ์ขึ้นไป\n• ไม่เป็นผู้ได้รับสวัสดิการหรือสิทธิประโยชน์อื่นใดจากหน่วยงานของรัฐ รัฐวิสาหกิจ หรือองค์กรปกครองส่วนท้องถิ่นที่จัดให้เป็นประจำ\n• ลงทะเบียนตามขั้นตอนในแต่ละพื้นที่",
        note: "เบี้ยยังชีพผู้สูงอายุไม่ใช่สิทธิประโยชน์จากประกันสังคม แต่เป็นสวัสดิการจากรัฐบาลที่มอบให้กับผู้สูงอายุทุกคนที่มีคุณสมบัติตามกำหนด ผู้ที่ได้รับบำนาญชราภาพประกันสังคมสามารถได้รับเบี้ยยังชีพผู้สูงอายุด้วยหากมีคุณสมบัติครบถ้วน",
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
              นี้คือสิทธิประโยชน์หลัก ๆ ของคุณใน{sectionTitle}
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
                                <Text mb={3} whiteSpace="pre-line">
                                  {benefitDetails[benefit].conditions}
                                </Text>

                                {benefitDetails[benefit].note && (
                                  <>
                                    <Text fontWeight="medium" mb={1}>
                                      หมายเหตุ
                                    </Text>
                                    <Text>{benefitDetails[benefit].note}</Text>
                                  </>
                                )}
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
              กดย้อนกลับ
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

    return (
      <Box bg="background.main" py={{ base: 16, md: 24 }}>
        <Container maxW="3xl">
          <VStack textAlign="center" mb={8} spacing={4}>
            <Heading as="h1" size="xl" mb={4}>
              แล้วตอนเกษียณ คุณจะได้อะไรกลับคืนบ้าง?
            </Heading>
            <Text variant="subtitle">
              กรอกระยะเวลาที่คุณส่งเงินสมทบ เพื่อประมาณการเงินกรณีชราภาพที่คุณจะได้รับ
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

              {/* Show visual calculation of total contribution */}
              {renderContributionVisualizer()}

              <Flex gap={4} justify="flex-end" mt={8}>
                <Button
                  variant="outline"
                  onClick={() => navigateTo("currentBenefits")}
                >
                  กดย้อนกลับ
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
                {selectedSection !== "notRegYet" && (
                  <Button
                    variant="outline"
                    onClick={() => navigateTo("userInput")}
                    isDisabled={isSubmitting}
                  >
                    กดย้อนกลับ
                  </Button>
                )}
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

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ width: "100%" }}
        >
          <SimpleGrid columns={[1, null, 3]} spacing={6}>
            <motion.div variants={staggerItem}>
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
            </motion.div>

            <motion.div variants={staggerItem}>
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
            </motion.div>

            <motion.div variants={staggerItem}>
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
            </motion.div>
          </SimpleGrid>
        </motion.div>
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

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              style={{ width: "100%" }}
            >
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                }}
                gap={8}
                w="full"
              >
                <motion.div variants={staggerItem}>
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
                </motion.div>

                <motion.div variants={staggerItem}>
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
                </motion.div>

                <motion.div variants={staggerItem}>
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
                </motion.div>

                <motion.div variants={staggerItem}>
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
                </motion.div>
              </Grid>
            </motion.div>

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

  // Motion variants for stagger entry
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18,
      },
    },
  };

  // Dynamic retirement-benefit estimate widget.
  // Reframes the old "money you paid in" view into "money you will get back at
  // retirement (กรณีชราภาพ)". Pure frontend calculation off the existing
  // userData fields — no schema / API change.
  const renderContributionVisualizer = () => {
    const headline = "ยอดเงินกรณีชราภาพที่คุณจะได้รับโดยประมาณ";
    let resultText = "";
    let displayAmount = 0;
    let unit = "บาท";
    let hasInput = false;
    const breakdown: Array<{ label: string; value: number; color: string }> = [];
    const messages: Array<{
      kind: "info" | "warn" | "goal";
      text: string;
      link?: { label: string; url: string };
    }> = [];
    let disclaimer =
      "* ตัวเลขนี้เป็นเพียงการประมาณการเบื้องต้น ไม่รวมดอกผลสะสมประจำปีที่ประกันสังคมประกาศเพิ่มเติม";

    // ── ค่าคงที่ตามกฎหมาย (แก้จุดเดียวเมื่อกฎเปลี่ยน) ──
    const PENSION_CEILING = 17500; // เพดานฐานเงินเดือน ปี 2569 (เดิม 15,000)
    const PENSION_BASE_RATE = 20; // % เมื่อส่งครบ 15 ปี
    const PENSION_INCREMENT = 1.5; // % ต่อปีที่ส่งเกิน 15 ปี
    const CHARAPHAP_RATE = 0.06; // เงินสมทบกรณีชราภาพ 3% (ผู้ประกันตน) + 3% (นายจ้าง)
    const M39_BASE = 4800; // ฐานเงินเดือน ม.39 (สูตรเดิม)
    const M40_INTEREST = 0.03; // ดอกผลทบต้น 3% ต่อปี (ม.40)
    const POVERTY_LINE = 2997; // เส้นความยากจน บาท/คน/เดือน (สศช. 2566)
    const M33_RETIRE_AGE = 55; // อายุครบสิทธิชราภาพ ม.33/39
    const M40_RETIRE_AGE = 60; // อายุครบสิทธิชราภาพ ม.40
    const CARE_URL = "https://sso.thaith.ai/care/";

    const currentAge = parseFloat(userData.age || "0") || 0;

    // อัตราบำนาญ (%) ตามจำนวนเดือนที่ส่งสมทบ
    const pensionRate = (months: number) =>
      months < 180
        ? 0
        : PENSION_BASE_RATE +
          Math.floor((months - 180) / 12) * PENSION_INCREMENT;

    // ทบต้นรายปีสำหรับเงินออมชราภาพ ม.40
    const compoundSavings = (monthlySave: number, months: number) => {
      let balance = 0;
      const fullYears = Math.floor(months / 12);
      const remMonths = months % 12;
      for (let y = 0; y < fullYears; y++) {
        balance = (balance + monthlySave * 12) * (1 + M40_INTEREST);
      }
      balance += monthlySave * remMonths; // เศษเดือนปีสุดท้าย ยังไม่ทบดอกผล
      return Math.round(balance);
    };

    // เปรียบเทียบบำนาญรายเดือนกับเส้นความยากจน
    const addPovertyComparison = (monthlyPension: number) => {
      const above = monthlyPension >= POVERTY_LINE;
      messages.push({
        kind: above ? "info" : "warn",
        text: above
          ? `บำนาญนี้สูงกว่าเส้นความยากจน (~${POVERTY_LINE.toLocaleString("th-TH")} บาท/คน/เดือน, สศช. 2566) แต่ยังควรมีเงินออมส่วนตัวเสริมเพื่อคุณภาพชีวิตที่ดีขึ้น`
          : `บำนาญนี้ต่ำกว่าเส้นความยากจน (~${POVERTY_LINE.toLocaleString("th-TH")} บาท/คน/เดือน, สศช. 2566) การมีเงินออมเสริมจึงสำคัญมาก`,
      });
    };

    const ceilingNote =
      "เพดานฐานเงินเดือนปรับเป็น 17,500 บาท (ปี 2569) และจะทยอยเพิ่มเป็น 20,000 บาท (ปี 2572) และ 23,000 บาท (ปี 2575)";

    if (selectedSection === "39") {
      // ── มาตรา 39: รวมระยะเวลาทั้ง ม.33 และ ม.39 ──
      const years33 = parseFloat(userData.yearsSection33 || "0") || 0;
      const months33 = parseFloat(userData.monthsSection33 || "0") || 0;
      const monthly33 = parseFloat(userData.monthlySection33 || "0") || 0;
      const years39 = parseFloat(userData.yearsSection39 || "0") || 0;
      const months39 = parseFloat(userData.monthsSection39 || "0") || 0;

      const tMonths33 = years33 * 12 + months33;
      const tMonths39 = years39 * 12 + months39;
      const totalCombinedMonths = tMonths33 + tMonths39;
      hasInput = totalCombinedMonths > 0;

      // คาดการณ์เดือนสะสมเมื่อส่งต่อจนเกษียณ (อายุ 55)
      const monthsToRetire =
        currentAge > 0 ? Math.max(0, M33_RETIRE_AGE - currentAge) * 12 : 0;
      const projectedMonths = totalCombinedMonths + monthsToRetire;

      if (totalCombinedMonths < 180) {
        // ได้เป็นเงินก้อน (บำเหน็จ) — ดึงยอดสะสมจริงมาแสดง
        const total33 = tMonths33 * monthly33;
        const total39 = tMonths39 * 432;
        displayAmount = total33 + total39;
        unit = "บาท";
        resultText = "คุณจะได้รับเป็นเงินก้อนครั้งเดียว (บำเหน็จชราภาพ)";

        if (total33 > 0) {
          breakdown.push({
            label: `มาตรา 33 (${years33} ปี${months33 > 0 ? ` ${months33} เดือน` : ""})`,
            value: total33,
            color: "#3D3A7E",
          });
        }
        if (total39 > 0) {
          breakdown.push({
            label: `มาตรา 39 (${years39} ปี${months39 > 0 ? ` ${months39} เดือน` : ""})`,
            value: total39,
            color: "#e0c927",
          });
        }

        // มองไปข้างหน้า — ใช้อายุปัจจุบันคำนวณว่าเมื่อเกษียณจะถึงบำนาญหรือไม่
        if (currentAge > 0 && projectedMonths >= 180) {
          const pension = M39_BASE * (pensionRate(projectedMonths) / 100);
          const py = Math.floor(projectedMonths / 12);
          messages.push({
            kind: "goal",
            text: `หากส่งต่อจนเกษียณอายุ ${M33_RETIRE_AGE} ปี (อีก ${Math.round(
              monthsToRetire / 12
            )} ปี) คุณจะส่งครบ ~${py} ปี และเปลี่ยนเป็นบำนาญรายเดือนตลอดชีวิต ~${Math.round(
              pension
            ).toLocaleString("th-TH")} บาท/เดือน`,
          });
        } else {
          const monthsToPension = 180 - totalCombinedMonths;
          const yLeft = Math.floor(monthsToPension / 12);
          const mLeft = monthsToPension % 12;
          messages.push({
            kind: "goal",
            text: `อีก ${yLeft} ปี${mLeft > 0 ? ` ${mLeft} เดือน` : ""} (เมื่อส่งสมทบรวมครบ 15 ปี) สิทธิ์ของคุณจะเปลี่ยนจาก "เงินก้อน" เป็น "บำนาญรายเดือนตลอดชีวิต"`,
          });
        }
      } else {
        // ได้เงินรายเดือน (บำนาญ) — ม.39 สูตรเดิมใช้ฐานเงินเดือนเฉลี่ยคงที่ 4,800 บาท
        const rate = pensionRate(totalCombinedMonths);
        displayAmount = M39_BASE * (rate / 100);
        unit = "บาท/เดือน";
        resultText = "คุณจะได้รับเป็นเงินรายเดือนตลอดชีวิต (บำนาญชราภาพ)";
        breakdown.push({
          label: `บำนาญรายเดือน (ฐาน ม.39 อัตรา ${rate}%)`,
          value: displayAmount,
          color: "#3D3A7E",
        });
        addPovertyComparison(displayAmount);
      }

      // กล่องแจ้งเตือน ม.39 — เพิ่มบริบทสูตรเดิม vs CARE (เริ่มใช้ปี 2570)
      messages.push({
        kind: "warn",
        text: "ตัวเลขนี้คำนวณตามสูตรเดิม (ฐานคงที่ 4,800 บาท) ตั้งแต่ปี 2570 สูตรใหม่ 'CARE' จะใช้ค่าจ้างเฉลี่ยตลอดชีวิตการทำงาน รวมช่วงที่เคยอยู่มาตรา 33 ด้วย ผลลัพธ์จริงของคุณจึงอาจแตกต่างจากนี้ แนะนำให้ติดตามสูตรใหม่",
        link: { label: "ลองคำนวณด้วยสูตร CARE", url: CARE_URL },
      });
    } else if (
      selectedSection === "40" ||
      selectedSection === "40-1" ||
      selectedSection === "40-2" ||
      selectedSection === "40-3"
    ) {
      // ── มาตรา 40: ได้เป็นเงินก้อน (บำเหน็จ) เท่านั้น ──
      const years = parseFloat(userData.yearsContributing || "0") || 0;
      const months = parseFloat(userData.monthsContributing || "0") || 0;
      const totalMonths = years * 12 + months;
      hasInput = totalMonths > 0;
      unit = "บาท";

      // ค่าทางเลือกอาจอยู่ใน monthlyContribution (จาก Radio) หรือยังว่างอยู่
      // จึง fallback จาก selectedSection เพื่อกันกรณี user ไม่ได้แตะ Radio
      const rawOption = userData.monthlyContribution || "";
      const optionChosen = ["70", "100", "300"].includes(rawOption)
        ? rawOption
        : selectedSection === "40-1"
        ? "70"
        : selectedSection === "40-3"
        ? "300"
        : "100"; // 40-2 หรือ 40 ทั่วไป

      const monthsToRetire =
        currentAge > 0 ? Math.max(0, M40_RETIRE_AGE - currentAge) * 12 : 0;
      const projectedMonths = totalMonths + monthsToRetire;

      // หมายเหตุสิทธิ์ ม.40 — แสดงเสมอ
      messages.push({
        kind: "info",
        text: "โปรดทราบ: ผู้ประกันตนมาตรา 40 จะได้รับสิทธิ์ชราภาพเป็น 'เงินก้อนครั้งเดียว (บำเหน็จ)' เท่านั้น ไม่มีบำนาญรายเดือนตลอดชีวิต",
      });

      if (optionChosen === "70") {
        displayAmount = 0;
        resultText = "ทางเลือกที่ 1 — ไม่มีการสะสมเงินออมกรณีชราภาพ";
        messages.push({
          kind: "warn",
          text: "ทางเลือกที่ 1 ของคุณ ไม่มีการสะสมเงินออมกรณีชราภาพ คุณจะไม่ได้รับเงินก้อนในส่วนนี้เมื่ออายุครบ 60 ปี",
        });
      } else {
        // ทางเลือก 2 = รัฐช่วยออม 50/เดือน, ทางเลือก 3 = 150/เดือน — ทบต้น 3%/ปี
        const monthlySave = optionChosen === "300" ? 150 : 50;
        const savings = compoundSavings(monthlySave, totalMonths);
        const bonus =
          optionChosen === "100" && totalMonths >= 180 ? 10000 : 0;
        displayAmount = savings + bonus;
        resultText = "เงินก้อนออมชราภาพ (บำเหน็จ)";
        if (displayAmount > 0) {
          breakdown.push({
            label: `ออมชราภาพ (${years} ปี${months > 0 ? ` ${months} เดือน` : ""})`,
            value: displayAmount,
            color: "#f3762a",
          });
        }
        messages.push({
          kind: "info",
          text: `รัฐช่วยออมให้เดือนละ ${monthlySave} บาท คำนวณรวมดอกผลทบต้นโดยประมาณ 3% ต่อปี${
            optionChosen === "100"
              ? totalMonths >= 180
                ? " (รวมโบนัสพิเศษจากรัฐ 10,000 บาทแล้ว)"
                : " หากส่งครบ 15 ปีจะได้รับโบนัสพิเศษจากรัฐอีก 10,000 บาท"
              : ""
          }`,
        });
        // มองไปข้างหน้าตามอายุ
        if (currentAge > 0 && projectedMonths > totalMonths) {
          const projSavings =
            compoundSavings(monthlySave, projectedMonths) +
            (optionChosen === "100" && projectedMonths >= 180 ? 10000 : 0);
          messages.push({
            kind: "goal",
            text: `หากส่งต่อจนอายุ ${M40_RETIRE_AGE} ปี (อีก ${Math.round(
              monthsToRetire / 12
            )} ปี) เงินก้อนชราภาพของคุณจะเพิ่มเป็นประมาณ ${projSavings.toLocaleString(
              "th-TH"
            )} บาท`,
          });
        }
        // หมายเหตุออมเพิ่ม (Phase 2 — ยังไม่รวมในการคำนวณ)
        messages.push({
          kind: "info",
          text: "หากคุณ 'ออมเพิ่ม' (สูงสุด 1,000 บาท/เดือน) เงินส่วนนี้จะได้รับดอกผลจากกองทุนเช่นกัน (ยังไม่รวมในการคำนวณนี้)",
        });
      }

      disclaimer =
        "* คำนวณรวมดอกผลทบต้นโดยประมาณ 3% ต่อปี เป็นการประมาณการเบื้องต้น ผลตอบแทนจริงขึ้นอยู่กับผลประกอบการของกองทุนประกันสังคม";
    } else {
      // ── มาตรา 33 (และ default) ──
      const years = parseFloat(userData.yearsContributing || "0") || 0;
      const months = parseFloat(userData.monthsContributing || "0") || 0;
      const totalMonths = years * 12 + months;
      hasInput = totalMonths > 0;

      const monthsToRetire =
        currentAge > 0 ? Math.max(0, M33_RETIRE_AGE - currentAge) * 12 : 0;
      const projectedMonths = totalMonths + monthsToRetire;

      if (totalMonths < 180) {
        // บำเหน็จชราภาพ = เงินสมทบกรณีชราภาพสะสม (6% ของฐานเพดาน: 3% ตน + 3% นายจ้าง)
        displayAmount = Math.round(totalMonths * (PENSION_CEILING * CHARAPHAP_RATE));
        unit = "บาท";
        resultText = "คุณจะได้รับเป็นเงินก้อนครั้งเดียว (บำเหน็จชราภาพ)";
        breakdown.push({
          label: `เงินก้อนบำเหน็จ (${years} ปี${months > 0 ? ` ${months} เดือน` : ""})`,
          value: displayAmount,
          color: "#3D3A7E",
        });

        // มองไปข้างหน้า — ใช้อายุปัจจุบันคาดการณ์ถึงตอนเกษียณ
        if (currentAge > 0 && projectedMonths >= 180) {
          const pension = PENSION_CEILING * (pensionRate(projectedMonths) / 100);
          const py = Math.floor(projectedMonths / 12);
          messages.push({
            kind: "goal",
            text: `หากส่งต่อจนเกษียณอายุ ${M33_RETIRE_AGE} ปี (อีก ${Math.round(
              monthsToRetire / 12
            )} ปี) คุณจะส่งครบ ~${py} ปี และเปลี่ยนเป็นบำนาญรายเดือนตลอดชีวิต ~${Math.round(
              pension
            ).toLocaleString("th-TH")} บาท/เดือน`,
          });
        } else {
          const monthsToPension = 180 - totalMonths;
          const yLeft = Math.floor(monthsToPension / 12);
          const mLeft = monthsToPension % 12;
          const pension = PENSION_CEILING * (PENSION_BASE_RATE / 100);
          messages.push({
            kind: "goal",
            text: `อีก ${yLeft} ปี${mLeft > 0 ? ` ${mLeft} เดือน` : ""} (เมื่อส่งสมทบครบ 15 ปี) สิทธิ์ของคุณจะเปลี่ยนจาก "เงินก้อน" เป็น "บำนาญรายเดือนตลอดชีวิต" ประมาณ ${pension.toLocaleString("th-TH")} บาท/เดือน`,
          });
        }
      } else {
        // ได้เงินรายเดือน (บำนาญ)
        const rate = pensionRate(totalMonths);
        displayAmount = PENSION_CEILING * (rate / 100);
        unit = "บาท/เดือน";
        resultText = "คุณจะได้รับเป็นเงินรายเดือนตลอดชีวิต (บำนาญชราภาพ)";
        breakdown.push({
          label: `บำนาญรายเดือน (อัตรา ${rate}%)`,
          value: displayAmount,
          color: "#3D3A7E",
        });

        // หากยังไม่เกษียณ คาดการณ์บำนาญที่เพิ่มขึ้นเมื่อส่งต่อ
        if (currentAge > 0 && projectedMonths > totalMonths) {
          const projPension =
            PENSION_CEILING * (pensionRate(projectedMonths) / 100);
          if (projPension > displayAmount) {
            messages.push({
              kind: "goal",
              text: `หากส่งต่อจนเกษียณอายุ ${M33_RETIRE_AGE} ปี บำนาญของคุณจะเพิ่มเป็นประมาณ ${Math.round(
                projPension
              ).toLocaleString("th-TH")} บาท/เดือน`,
            });
          }
        }
        addPovertyComparison(displayAmount);
      }

      disclaimer = `* คำนวณบนฐานเพดานเงินเดือนสูงสุด ${PENSION_CEILING.toLocaleString(
        "th-TH"
      )} บาท — ${ceilingNote} ตัวเลขนี้เป็นการประมาณการเบื้องต้น ไม่รวมดอกผลสะสมประจำปีที่ประกันสังคมประกาศเพิ่มเติม`;
    }

    // ม.40 หัวข้อแยกเฉพาะ
    const widgetHeadline =
      selectedSection === "40" ||
      selectedSection === "40-1" ||
      selectedSection === "40-2" ||
      selectedSection === "40-3"
        ? "ยอดเงินออมชราภาพสะสมที่จะได้รับ (ตอนอายุ 60 ปี)"
        : headline;

    if (!hasInput) return null;

    const barTotal = breakdown.reduce((sum, item) => sum + item.value, 0);

    return (
      <Box
        bg="white"
        borderWidth="1px"
        borderRadius="xl"
        borderColor="gray.200"
        p={6}
        shadow="md"
        mb={6}
        mt={4}
      >
        <VStack align="stretch" spacing={5}>
          <Box>
            <Flex
              justify="space-between"
              align="baseline"
              direction={{ base: "column", sm: "row" }}
              gap={2}
            >
              <Text fontSize="md" fontWeight="bold" color="gray.600">
                {widgetHeadline}
              </Text>
              <Heading size="lg" color="primary.500" fontWeight="extrabold">
                {displayAmount.toLocaleString("th-TH")}{" "}
                <Text as="span" fontSize="md" fontWeight="bold" color="gray.500">
                  {unit}
                </Text>
              </Heading>
            </Flex>
            {resultText && (
              <Text fontSize="sm" color="accent.600" fontWeight="bold" mt={1}>
                {resultText}
              </Text>
            )}
          </Box>

          {/* Visual Progress Bar Chart */}
          {barTotal > 0 && (
            <Box
              h="4"
              w="full"
              bg="gray.100"
              borderRadius="full"
              overflow="hidden"
              display="flex"
            >
              {breakdown.map((item, idx) => {
                const pct = (item.value / barTotal) * 100;
                return (
                  <Tooltip
                    key={idx}
                    label={`${item.label}: ${item.value.toLocaleString("th-TH")} ${unit}`}
                    hasArrow
                  >
                    <Box
                      w={`${pct}%`}
                      h="full"
                      bg={item.color}
                      transition="width 1s ease"
                    />
                  </Tooltip>
                );
              })}
            </Box>
          )}

          {/* Labels and Detailed Legend */}
          {barTotal > 0 && (
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
              {breakdown.map((item, idx) => {
                const pct = Math.round((item.value / barTotal) * 100);
                return (
                  <Flex
                    key={idx}
                    align="center"
                    gap={3}
                    p={2}
                    borderRadius="lg"
                    bg="gray.50"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <Box w="3" h="3" borderRadius="full" bg={item.color} flexShrink={0} />
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontWeight="bold" noOfLines={1}>
                        {item.label}
                      </Text>
                      <Text fontSize="sm" fontWeight="extrabold" color="gray.800">
                        {item.value.toLocaleString("th-TH")} {unit} ({pct}%)
                      </Text>
                    </Box>
                  </Flex>
                );
              })}
            </Grid>
          )}

          {/* Educational / warning message boxes — icon chip carries the
              semantic category at zero conscious tax (Signal 39 Layer 1) */}
          {messages.map((msg, idx) => {
            // Map the 3 statuses onto the 3 brand hues only:
            // warn → accent (orange), goal → primary (purple), info → secondary (yellow)
            const tone =
              msg.kind === "warn"
                ? {
                    bg: "accent.50",
                    chipBg: "accent.500",
                    iconColor: "white",
                    text: "accent.700",
                    linkColor: "accent.600",
                    icon: FiAlertTriangle,
                  }
                : msg.kind === "goal"
                ? {
                    bg: "primary.50",
                    chipBg: "primary.500",
                    iconColor: "white",
                    text: "primary.700",
                    linkColor: "primary.600",
                    icon: FiTarget,
                  }
                : {
                    bg: "secondary.50",
                    chipBg: "secondary.400",
                    iconColor: "primary.800",
                    text: "text.primary",
                    linkColor: "primary.700",
                    icon: FiInfo,
                  };
            return (
              <Flex
                key={idx}
                bg={tone.bg}
                borderRadius="lg"
                p={3}
                gap={3}
                align="flex-start"
              >
                <Flex
                  bg={tone.chipBg}
                  borderRadius="md"
                  align="center"
                  justify="center"
                  boxSize={7}
                  flexShrink={0}
                >
                  <Icon as={tone.icon} color={tone.iconColor} boxSize={4} />
                </Flex>
                <Box pt={0.5}>
                  <Text
                    fontSize="sm"
                    color={tone.text}
                    fontWeight={msg.kind === "goal" ? "semibold" : "normal"}
                    lineHeight="relaxed"
                  >
                    {msg.text}
                  </Text>
                  {msg.link && (
                    <Text
                      as="a"
                      href={msg.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      display="inline-block"
                      mt={1}
                      fontSize="sm"
                      fontWeight="semibold"
                      color={tone.linkColor}
                      textDecoration="underline"
                    >
                      {msg.link.label}
                    </Text>
                  )}
                </Box>
              </Flex>
            );
          })}

          {/* Disclaimer */}
          <Box borderTopWidth="1px" borderColor="gray.100" pt={3}>
            <Text fontSize="xs" color="gray.400" lineHeight="relaxed">
              {disclaimer}
            </Text>
          </Box>
        </VStack>
      </Box>
    );
  };

  // Defined steps for the stepper
  const steps = selectedSection === "notRegYet"
    ? [
        { id: 1, label: "เลือกมาตรา", sections: ["selection"] },
        { id: 2, label: "ร่วมเสนอแนะ", sections: ["suggestBenefits"] },
      ]
    : [
        { id: 1, label: "เลือกมาตรา", sections: ["selection", "section40Options"] },
        { id: 2, label: "สิทธิประโยชน์", sections: ["currentBenefits"] },
        { id: 3, label: "ประมาณการเงินเกษียณ", sections: ["userInput"] },
        { id: 4, label: "ร่วมเสนอแนะ", sections: ["suggestBenefits"] },
      ];

  const renderStepper = () => {
    if (currentSection === "home" || currentSection === "end") return null;

    const activeStep = steps.findIndex(step => step.sections.includes(currentSection)) + 1;

    return (
      <Container maxW="3xl" my={{ base: 4, md: 8 }}>
        <Flex justify="space-between" align="center" position="relative" px={2}>
          {/* Background Track */}
          <Box
            position="absolute"
            top="50%"
            left="4%"
            right="4%"
            h="2px"
            bg="gray.200"
            zIndex={1}
            transform="translateY(-50%)"
          />
          {/* Active Track Progress */}
          <Box
            position="absolute"
            top="50%"
            left="4%"
            h="2px"
            bg="primary.500"
            zIndex={2}
            transform="translateY(-50%)"
            transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            width={activeStep > 1 ? `${((activeStep - 1) / (steps.length - 1)) * 92}%` : "0%"}
          />

          {steps.map((step) => {
            const isCompleted = activeStep > step.id;
            const isActive = activeStep === step.id;

            return (
              <Flex
                key={step.id}
                direction="column"
                align="center"
                zIndex={3}
                position="relative"
              >
                {/* Step Circle */}
                <Flex
                  w={{ base: 8, md: 10 }}
                  h={{ base: 8, md: 10 }}
                  borderRadius="full"
                  bg={isCompleted ? "primary.500" : isActive ? "white" : "gray.100"}
                  border="2px solid"
                  borderColor={isCompleted || isActive ? "primary.500" : "gray.300"}
                  align="center"
                  justify="center"
                  color={isCompleted ? "white" : isActive ? "primary.500" : "gray.400"}
                  fontWeight="bold"
                  fontSize={{ base: "xs", md: "sm" }}
                  transition="all 0.3s ease"
                  shadow={isActive ? "md" : "none"}
                >
                  {isCompleted ? (
                    <Icon as={FiCheck} boxSize={4} />
                  ) : (
                    step.id
                  )}
                </Flex>
                {/* Step Label */}
                <Text
                  mt={2}
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight={isActive ? "bold" : "semibold"}
                  color={isActive ? "primary.500" : isCompleted ? "gray.600" : "gray.400"}
                  textAlign="center"
                  whiteSpace="nowrap"
                  display={{ base: "none", sm: "block" }}
                >
                  {step.label}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Container>
    );
  };

  return (
    <>
      <Box as="main" pb={{ base: 8, md: 10 }} overflow="hidden">
        {renderStepper()}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </Box>
      <Footer />
    </>
  );
}


