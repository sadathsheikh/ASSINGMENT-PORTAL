import { Box, Button, Container, Heading, Text, VStack, HStack, Image, SimpleGrid, Card, CardBody, Icon, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, StarIcon, InfoIcon } from '@chakra-ui/icons';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Assignment Management",
      description: "Teachers can create, manage, and grade assignments with ease",
      icon: CheckCircleIcon,
    },
    {
      title: "Multimedia Submissions",
      description: "Students can submit text responses with up to 5 images per assignment",
      icon: StarIcon,
    },
    {
      title: "Real-time Collaboration",
      description: "Instant updates and notifications for seamless teacher-student interaction",
      icon: InfoIcon,
    }
  ];

  const stats = [
    { number: "100%", label: "Secure & Private" },
    { number: "24/7", label: "Available Access" },
    { number: "∞", label: "Assignments" },
  ];

  return (
    <Box minH="100vh" bg="linear-gradien
    t(135deg, #f8fafc 0%, #e2e8f0 100%)">
      {/* Navigation Bar */}
      <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={1000}>
        <Container maxW="7xl" py={4}>
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="#7d02c4" fontWeight="800">
              🎓 Assignment Portal
            </Heading>
            <HStack spacing={4}>
              <Button
                variant="ghost"
                color="#7d02c4"
                _hover={{ bg: "purple.50" }}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                bg="#7d02c4"
                color="white"
                _hover={{ bg: "#6b019f", transform: "translateY(-2px)" }}
                borderRadius="8px"
                px={6}
                transition="all 0.3s"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxW="7xl" pt={20} pb={16}>
        <VStack spacing={8} textAlign="center">
          <VStack spacing={4}>
            <Heading 
              size="2xl" 
              color="gray.800"
              fontWeight="800"
              lineHeight="shorter"
              maxW="4xl"
            >
              Modern Assignment Management
              <Text as="span" color="#7d02c4"> Made Simple</Text>
            </Heading>
            <Text 
              fontSize="xl" 
              color="gray.600" 
              maxW="2xl"
              lineHeight="tall"
            >
              Streamline your educational workflow with our intuitive assignment portal. 
              Perfect for teachers and students seeking efficient, collaborative learning.
            </Text>
          </VStack>

          <HStack spacing={4} pt={4}>
            <Button
              size="lg"
              bg="#7d02c4"
              color="white"
              _hover={{ bg: "#6b019f", transform: "translateY(-2px)", boxShadow: "xl" }}
              borderRadius="12px"
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="600"
              transition="all 0.3s"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              borderColor="#7d02c4"
              color="#7d02c4"
              _hover={{ bg: "#7d02c4", color: "white", transform: "translateY(-2px)" }}
              borderRadius="12px"
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="600"
              transition="all 0.3s"
              onClick={() => navigate('/login')}
            >
              Login Now
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Stats Section */}
      <Box bg="white" py={16}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} textAlign="center">
            {stats.map((stat, index) => (
              <VStack key={index} spacing={2}>
                <Text fontSize="4xl" fontWeight="800" color="#7d02c4">
                  {stat.number}
                </Text>
                <Text fontSize="lg" color="gray.600" fontWeight="500">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="gray.800" fontWeight="700">
              Everything You Need
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Powerful features designed to enhance the teaching and learning experience
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {features.map((feature, index) => (
              <Card 
                key={index}
                bg="white"
                borderRadius="16px"
                boxShadow="0 4px 20px rgba(125, 2, 196, 0.1)"
                border="1px solid"
                borderColor="gray.100"
                _hover={{ 
                  transform: "translateY(-4px)", 
                  boxShadow: "0 8px 30px rgba(125, 2, 196, 0.15)",
                  borderColor: "#7d02c4"
                }}
                transition="all 0.3s"
                p={6}
              >
                <CardBody textAlign="center">
                  <VStack spacing={4}>
                    <Box
                      bg="#7d02c4"
                      color="white"
                      borderRadius="full"
                      p={3}
                      display="inline-flex"
                    >
                      <Icon as={feature.icon} boxSize={6} />
                    </Box>
                    <Heading size="md" color="gray.800">
                      {feature.title}
                    </Heading>
                    <Text color="gray.600" lineHeight="tall">
                      {feature.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* How It Works Section */}
      <Box bg="white" py={20}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color="gray.800" fontWeight="700">
                How It Works
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Get started in just a few simple steps
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <VStack spacing={4} textAlign="center">
                <Box
                  bg="#7d02c4"
                  color="white"
                  borderRadius="full"
                  w={16}
                  h={16}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  fontWeight="800"
                >
                  1
                </Box>
                <Heading size="md" color="gray.800">Sign Up</Heading>
                <Text color="gray.600">
                  Create your account as a teacher or student in seconds
                </Text>
              </VStack>

              <VStack spacing={4} textAlign="center">
                <Box
                  bg="#7d02c4"
                  color="white"
                  borderRadius="full"
                  w={16}
                  h={16}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  fontWeight="800"
                >
                  2
                </Box>
                <Heading size="md" color="gray.800">Create & Submit</Heading>
                <Text color="gray.600">
                  Teachers create assignments, students submit with text and images
                </Text>
              </VStack>

              <VStack spacing={4} textAlign="center">
                <Box
                  bg="#7d02c4"
                  color="white"
                  borderRadius="full"
                  w={16}
                  h={16}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  fontWeight="800"
                >
                  3
                </Box>
                <Heading size="md" color="gray.800">Grade & Feedback</Heading>
                <Text color="gray.600">
                  Review submissions and provide detailed feedback instantly
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxW="7xl" py={20}>
        <Box
          bg="linear-gradient(135deg, #7d02c4 0%, #9333ea 100%)"
          borderRadius="24px"
          p={12}
          textAlign="center"
          color="white"
        >
          <VStack spacing={6}>
            <Heading size="xl" fontWeight="700">
              Ready to Transform Your Classroom?
            </Heading>
            <Text fontSize="lg" opacity={0.9} maxW="2xl">
              Join thousands of educators already using Assignment Portal to streamline their teaching workflow
            </Text>
            <Button
              size="lg"
              bg="white"
              color="#7d02c4"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              borderRadius="12px"
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="600"
              transition="all 0.3s"
              onClick={() => navigate('/register')}
            >
              Get Started Today
            </Button>
          </VStack>
        </Box>
      </Container>

      {/* Footer */}
      <Box bg="gray.800" color="white" py={8}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" flexDirection={{ base: "column", md: "row" }} gap={4}>
            <Text>&copy; 2024 Assignment Portal. All rights reserved.</Text>
            <HStack spacing={6}>
              <Text cursor="pointer" _hover={{ color: "#7d02c4" }}>Privacy Policy</Text>
              <Text cursor="pointer" _hover={{ color: "#7d02c4" }}>Terms of Service</Text>
              <Text cursor="pointer" _hover={{ color: "#7d02c4" }}>Support</Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}