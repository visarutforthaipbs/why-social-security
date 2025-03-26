"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FiUser,
  FiDollarSign,
  FiHeart,
  FiChevronUp,
  FiChevronDown,
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
  Textarea,
  Checkbox,
  RadioGroup,
  Radio,
  useToast,
} from "@chakra-ui/react";
import { saveFeedback } from "@/services/feedbackService";

// Define section types for type safety
type Section =
  | "home"
  | "selection"
  | "currentBenefits"
  | "userInput"
  | "suggestBenefits"
  | "end";
type SectionType = "33" | "39" | "40" | null;

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
  monthlyContribution: string; // Add monthly contribution amount
  usedBenefits: string[]; // Add field to track used benefits
  [key: string]: string | string[] | undefined; // Allow for additional fields, potentially undefined
}

// Define suggested benefits interface
interface SuggestedBenefits {
  healthcare: boolean;
  retirement: boolean;
  unemployment: boolean;
  disability: boolean;
  childSupport: boolean;
  other: string;
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
    monthlyContribution: "", // Initialize monthly contribution
    usedBenefits: [], // Initialize with empty array
  });
  const [suggestedBenefits, setSuggestedBenefits] = useState<SuggestedBenefits>(
    {
      healthcare: false,
      retirement: false,
      unemployment: false,
      disability: false,
      childSupport: false,
      other: "",
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

  // Handler for submitting feedback to MongoDB
  const handleSubmitFeedback = async () => {
    if (!selectedSection) {
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
                    <br /> ทำอะไรได้บ้าง
                  </Text>
                </Heading>
                <Text fontSize={{ base: "lg", md: "xl" }} mb={8}>
                  มาลองรู้จักสิทธิของคุณในประกันสังคม
                  <br /> และร่วมออกแบบว่าประกันสังคมจะดีขึ้นได้อย่างไร?
                </Text>
                <ChakraButton
                  text="มารู้จักประกันสังคมของคุณ"
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
        "การรักษาพยาบาล",
        "สิทธิการคลอดบุตร",
        "เงินทดแทนกรณีทุพพลภาพ",
        "เงินค่าทำศพ",
        "บำนาญชราภาพ",
        "เงินช่วยเหลือกรณีว่างงาน",
        "เงินสงเคราะห์บุตร",
      ],
      "39": [
        "การรักษาพยาบาล",
        "สิทธิการคลอดบุตร",
        "เงินทดแทนกรณีทุพพลภาพ",
        "เงินค่าทำศพ",
        "บำนาญชราภาพ",
        "เงินสงเคราะห์บุตร",
      ],
      "40": [
        "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
        "เงินทดแทนกรณีทุพพลภาพ",
        "เงินค่าทำศพ",
        "เงินบำเหน็จชราภาพ",
      ],
    };

    // Add detailed descriptions for each benefit
    const benefitDetails: Record<string, BenefitDetail> = {
      การรักษาพยาบาล: {
        description:
          "รักษาฟรีที่โรงพยาบาลตามบัตรรับรองสิทธิ รวมถึงค่ายา ค่าอาหาร ค่าห้องสามัญ ค่าวินิจฉัยโรค ค่าบริการทางการแพทย์ และค่าบริการอื่นๆที่จำเป็น",
        limit: "ไม่จำกัดจำนวนครั้งและวงเงิน ตามความจำเป็นทางการแพทย์",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 3 เดือน ภายในระยะเวลา 15 เดือนก่อนวันรับบริการ",
      },
      สิทธิการคลอดบุตร: {
        description:
          "ได้รับเงินค่าคลอดบุตรเหมาจ่าย และเงินสงเคราะห์การหยุดงานเพื่อการคลอดบุตร",
        limit:
          "ค่าคลอดบุตรเหมาจ่าย 15,000 บาทต่อครั้ง และเงินสงเคราะห์การหยุดงาน 50% ของค่าจ้างเฉลี่ยเป็นเวลา 90 วัน",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 5 เดือน ภายในระยะเวลา 15 เดือนก่อนคลอด และได้สิทธิไม่เกิน 3 ครั้ง",
      },
      เงินทดแทนกรณีทุพพลภาพ: {
        description:
          "ได้รับเงินทดแทนการขาดรายได้ และค่ารักษาพยาบาลกรณีทุพพลภาพ",
        limit:
          "เงินทดแทนการขาดรายได้ 50% ของค่าจ้างเฉลี่ยเป็นระยะเวลาตลอดชีวิต และค่ารักษาพยาบาลตามจริงไม่เกิน 2,000 บาทต่อเดือน",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 3 เดือน ภายในระยะเวลา 15 เดือนก่อนทุพพลภาพ",
      },
      เงินค่าทำศพ: {
        description: "เงินช่วยเหลือค่าทำศพให้แก่ผู้จัดการศพ",
        limit: "50,000 บาท",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 1 เดือน ภายในระยะเวลา 6 เดือนก่อนเสียชีวิต",
      },
      บำนาญชราภาพ: {
        description:
          "เงินบำนาญรายเดือนหรือเงินบำเหน็จชราภาพครั้งเดียวเมื่อมีอายุครบ 55 ปี และสิ้นสุดความเป็นผู้ประกันตน",
        limit:
          "เงินบำนาญรายเดือน = 20% ของค่าจ้างเฉลี่ย 60 เดือนสุดท้าย (ถ้าจ่ายเงินสมทบมากกว่า 180 เดือนจะได้รับเพิ่ม 1.5% ต่อระยะเวลาการจ่ายเงินสมทบที่เพิ่มขึ้นทุก 12 เดือน)",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 180 เดือน (15 ปี) สำหรับบำนาญรายเดือน หรือไม่น้อยกว่า 1 เดือนแต่ไม่ถึง 180 เดือนสำหรับเงินบำเหน็จครั้งเดียว",
      },
      เงินช่วยเหลือกรณีว่างงาน: {
        description:
          "เงินทดแทนระหว่างการว่างงานกรณีถูกเลิกจ้าง ลาออก หรือสิ้นสุดสัญญาจ้าง",
        limit:
          "กรณีถูกเลิกจ้าง: 70% ของค่าจ้างเฉลี่ย ไม่เกิน 200 วัน, กรณีลาออกหรือสิ้นสุดสัญญาจ้าง: 45% ของค่าจ้างเฉลี่ย ไม่เกิน 90 วัน",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 6 เดือน ภายในระยะเวลา 15 เดือนก่อนการว่างงาน และต้องขึ้นทะเบียนหางานที่สำนักงานจัดหางาน",
      },
      เงินสงเคราะห์บุตร: {
        description: "เงินสงเคราะห์รายเดือนสำหรับบุตรที่ชอบด้วยกฎหมาย",
        limit:
          "800 บาทต่อเดือนต่อบุตร 1 คน สำหรับบุตรอายุแรกเกิดถึง 6 ปี ไม่เกิน 3 คน",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 12 เดือน ภายในระยะเวลา 36 เดือนก่อนเดือนที่มีสิทธิ",
      },
      เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย: {
        description:
          "เงินทดแทนการขาดรายได้และค่ารักษาพยาบาลเมื่อเจ็บป่วยที่ไม่ได้เกิดจากการทำงาน",
        limit:
          "ค่ารักษาพยาบาลตามจริงไม่เกิน 15,000 บาทต่อครั้ง และเงินทดแทนการขาดรายได้รายวันกรณีพักรักษาตัว",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 3 เดือน ภายในระยะเวลา 15 เดือนก่อนเจ็บป่วย",
      },
      เงินบำเหน็จชราภาพ: {
        description:
          "เงินก้อนที่จ่ายให้ครั้งเดียวเมื่อมีอายุครบ 60 ปีและสิ้นสุดความเป็นผู้ประกันตน",
        limit:
          "จำนวนเงินบำเหน็จชราภาพขึ้นอยู่กับระยะเวลาและจำนวนเงินสมทบที่ผู้ประกันตนและรัฐบาลนำส่งเข้ากองทุน",
        conditions:
          "ต้องจ่ายเงินสมทบมาแล้วไม่น้อยกว่า 1 เดือน และมีอายุครบ 60 ปีบริบูรณ์",
      },
    };

    const sectionTitle =
      selectedSection === "33"
        ? "มาตรา 33"
        : selectedSection === "39"
        ? "มาตรา 39"
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
                                <Text mb={3}>
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
        const years = parseFloat(userData.yearsContributing);
        const monthly = parseFloat(userData.monthlyContribution);
        if (!isNaN(years) && !isNaN(monthly)) {
          return (years * 12 * monthly).toLocaleString("th-TH");
        }
      }
      return "0";
    };

    // Get contribution explanation based on selected section
    const getContributionExplanation = () => {
      if (selectedSection === "33") {
        return "5% ของเงินเดือน (สูงสุด 750 บาท สำหรับเงินเดือน 15,000 บาทขึ้นไป)";
      } else if (selectedSection === "39") {
        return "อัตราคงที่ 432 บาทต่อเดือน";
      } else if (selectedSection === "40") {
        return "";
      }
      return "";
    };

    // Get the relevant benefits for the selected section
    const getSectionBenefits = () => {
      const benefits = {
        "33": [
          "การรักษาพยาบาล",
          "สิทธิการคลอดบุตร",
          "เงินทดแทนกรณีทุพพลภาพ",
          "เงินค่าทำศพ",
          "บำนาญชราภาพ",
          "เงินช่วยเหลือกรณีว่างงาน",
          "เงินสงเคราะห์บุตร",
        ],
        "39": [
          "การรักษาพยาบาล",
          "สิทธิการคลอดบุตร",
          "เงินทดแทนกรณีทุพพลภาพ",
          "เงินค่าทำศพ",
          "บำนาญชราภาพ",
          "เงินสงเคราะห์บุตร",
        ],
        "40": [
          "เงินทดแทนกรณีประสบอันตรายหรือเจ็บป่วย",
          "เงินทดแทนกรณีทุพพลภาพ",
          "เงินค่าทำศพ",
          "เงินบำเหน็จชราภาพ",
        ],
      };

      return selectedSection ? benefits[selectedSection] : [];
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
                        (benefit) => !userData.usedBenefits.includes(benefit)
                      )
                      .map((benefit, index) => (
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

              <FormControl mb={4}>
                <FormLabel>จำนวนปีที่จ่ายเงินเข้าประกันสังคม</FormLabel>
                <Input
                  type="number"
                  value={userData.yearsContributing}
                  onChange={(e) =>
                    updateUserData({ yearsContributing: e.target.value })
                  }
                  required
                />
              </FormControl>

              {selectedSection === "40" ? (
                <FormControl mb={4}>
                  <FormLabel>ทางเลือกที่คุณใช้ในมาตรา 40</FormLabel>
                  <RadioGroup
                    value={userData.monthlyContribution || "100"}
                    onChange={handleRadioChange}
                  >
                    <VStack align="flex-start" spacing={3}>
                      <Radio value="70" colorScheme="primary">
                        <Box>
                          <Text fontWeight="medium">
                            ทางเลือกที่ 1 (70 บาท)
                          </Text>
                          <Text fontSize="sm" color="text.muted">
                            ประสบอันตราย/เจ็บป่วย, ทุพพลภาพ, ตาย
                          </Text>
                        </Box>
                      </Radio>
                      <Radio value="100" colorScheme="primary">
                        <Box>
                          <Text fontWeight="medium">
                            ทางเลือกที่ 2 (100 บาท)
                          </Text>
                          <Text fontSize="sm" color="text.muted">
                            ทางเลือก 1 + ชราภาพ
                          </Text>
                        </Box>
                      </Radio>
                      <Radio value="300" colorScheme="primary">
                        <Box>
                          <Text fontWeight="medium">
                            ทางเลือกที่ 3 (300 บาท)
                          </Text>
                          <Text fontSize="sm" color="text.muted">
                            ทางเลือก 2 + สงเคราะห์บุตร
                          </Text>
                        </Box>
                      </Radio>
                    </VStack>
                  </RadioGroup>
                </FormControl>
              ) : (
                <FormControl mb={2}>
                  <FormLabel>
                    จำนวนเงินที่จ่ายเข้าประกันสังคมต่อเดือน (บาท)
                  </FormLabel>
                  <Input
                    type="number"
                    value={
                      userData.monthlyContribution || getDefaultContribution()
                    }
                    onChange={(e) =>
                      updateUserData({ monthlyContribution: e.target.value })
                    }
                    required
                  />
                  <Text fontSize="sm" color="text.muted" mt={1}>
                    {getContributionExplanation()}
                  </Text>
                </FormControl>
              )}

              {/* Show calculation of total contribution */}
              {userData.yearsContributing && userData.monthlyContribution ? (
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
                    คำนวณจาก {userData.yearsContributing} ปี × 12 เดือน ×{" "}
                    {parseFloat(userData.monthlyContribution).toLocaleString(
                      "th-TH"
                    )}{" "}
                    บาท
                  </Text>
                </Box>
              ) : (
                <Box bg="gray.50" p={4} borderRadius="md" mb={6} mt={4}>
                  <Text color="gray.500" fontStyle="italic" textAlign="center">
                    กรุณากรอกจำนวนปีและเงินที่จ่ายต่อเดือนเพื่อดูยอดรวมการจ่ายทั้งหมด
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
            <Heading as="h1" size="xl" mb={4}>
              สิทธิประโยชน์ที่คุณต้องการ
            </Heading>
            <Text variant="subtitle">
              เลือกสิทธิประโยชน์ที่คุณต้องการให้มีหรือปรับปรุงในระบบประกันสังคม
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
                    การรักษาพยาบาลที่ครอบคลุมมากขึ้น
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
                    บำนาญชราภาพที่เพียงพอต่อการดำรงชีพ
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
                    เงินช่วยเหลือกรณีว่างงานที่มากขึ้น
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
                    เงินทดแทนกรณีทุพพลภาพที่เหมาะสม
                  </Text>
                </Checkbox>

                <Checkbox
                  id="childSupport"
                  size="lg"
                  colorScheme="primary"
                  isChecked={suggestedBenefits.childSupport}
                  onChange={(e) =>
                    updateSuggestedBenefits("childSupport", e.target.checked)
                  }
                >
                  <Text fontSize="lg" ml={2}>
                    เงินช่วยเหลือด้านการศึกษาบุตร
                  </Text>
                </Checkbox>
              </VStack>

              <FormControl mb={6}>
                <FormLabel>สิทธิประโยชน์อื่นๆ ที่คุณต้องการ</FormLabel>
                <Textarea
                  h="32"
                  placeholder="ระบุสิทธิประโยชน์ที่คุณต้องการเพิ่มเติม..."
                  value={suggestedBenefits.other}
                  onChange={(e) =>
                    updateSuggestedBenefits("other", e.target.value)
                  }
                />
              </FormControl>

              <Flex gap={4} justify="flex-end" mt={8}>
                <Button
                  variant="outline"
                  onClick={() => navigateTo("userInput")}
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
                <path d="M5 13l4 4L19 7" />
              </Icon>
            </Box>

            <Heading as="h1" size="xl" fontWeight="bold" mb={4}>
              ขอบคุณสำหรับความคิดเห็นของคุณ!
            </Heading>
            <Text variant="subtitle" fontSize="xl" mb={8}>
              เสียงของคุณมีความสำคัญในการพัฒนาระบบประกันสังคมให้ตอบโจทย์คนรุ่นใหม่มากขึ้น
            </Text>

            <Box mt={8}>
              <Button onClick={() => navigateTo("home")}>กลับสู่หน้าแรก</Button>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  };

  // Section Selection
  const renderSelectionSection = () => {
    return (
      <Box bg="background.main" py={{ base: 16, md: 24 }}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            <Heading as="h1" size="xl" textAlign="center" mb={8}>
              คุณอยู่ในประกันสังคมประเภทไหน?
            </Heading>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={8}
              w="full"
            >
              <ChakraCard
                title="มาตรา 33"
                description="สำหรับลูกจ้างในสถานประกอบการ"
                icon={<FiUser size={24} />}
                benefits={[
                  "รับสิทธิประโยชน์ครบทุกกรณี 7 กรณี",
                  "เงินสมทบจ่ายโดยนายจ้าง ลูกจ้าง และรัฐบาล",
                  "คุ้มครองกรณีว่างงาน",
                  "จ่าย 5% ของเงินเดือน (สูงสุด 750 บาท)",
                ]}
                gradientFrom="#3d3a7e"
                gradientTo="#3d3a7e"
                onClick={() => handleSectionTypeSelect("33")}
              />
              <ChakraCard
                title="มาตรา 39"
                description="สำหรับผู้ที่เคยเป็นผู้ประกันตนมาตรา 33"
                icon={<FiDollarSign size={24} />}
                benefits={[
                  "รับสิทธิประโยชน์ 6 กรณี (ยกเว้นกรณีว่างงาน)",
                  "จ่ายเงินสมทบเองในอัตราคงที่",
                  "สามารถส่งเงินสมทบได้หลายช่องทาง",
                  "จ่ายเดือนละ 432 บาท",
                ]}
                gradientFrom="#F9E450"
                gradientTo="#F9E450"
                onClick={() => handleSectionTypeSelect("39")}
              />
              <ChakraCard
                title="มาตรา 40"
                description="สำหรับผู้ประกอบอาชีพอิสระ"
                icon={<FiHeart size={24} />}
                benefits={[
                  "เลือกจ่ายเงินสมทบได้ตามความสามารถ",
                  "มี 3 ทางเลือกตามชุดสิทธิประโยชน์",
                  "จ่ายเงินสมทบเองในอัตราที่กำหนด",
                  "ทางเลือกที่ 1-3: 70, 100, หรือ 300 บาท",
                ]}
                gradientFrom="#f3762a"
                gradientTo="#f3762a"
                onClick={() => handleSectionTypeSelect("40")}
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
