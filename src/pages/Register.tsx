import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  Link,
  Alert,
  AlertIcon,
  IconButton,
  RadioGroup,
  Radio,
  HStack,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      await register(email, password, name, role);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" py={12}>
        <Container maxW="md">
          <Card
            bg="white"
            borderRadius="20px"
            boxShadow="0 10px 40px rgba(125, 2, 196, 0.1)"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
          >
            <CardHeader bg="linear-gradient(135deg, #7d02c4 0%, #9333ea 100%)" color="white" textAlign="center" py={8}>
              <VStack spacing={2}>
                <Heading size="lg" fontWeight="700">Join Assignment Portal</Heading>
                <Text opacity={0.9}>Create your account to get started</Text>
              </VStack>
            </CardHeader>
            
            <CardBody p={8}>
              <form onSubmit={handleRegister}>
                <VStack spacing={6}>
                  {error && (
                    <Alert status="error" borderRadius="12px" bg="red.50" border="1px solid" borderColor="red.200">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}
                  
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="600">Full Name</FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      borderRadius="12px"
                      borderColor="gray.200"
                      _focus={{ borderColor: "#7d02c4", boxShadow: "0 0 0 1px #7d02c4" }}
                      py={6}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="600">Email Address</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      borderRadius="12px"
                      borderColor="gray.200"
                      _focus={{ borderColor: "#7d02c4", boxShadow: "0 0 0 1px #7d02c4" }}
                      py={6}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="600">Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password (min. 6 characters)"
                        borderRadius="12px"
                        borderColor="gray.200"
                        _focus={{ borderColor: "#7d02c4", boxShadow: "0 0 0 1px #7d02c4" }}
                        py={6}
                      />
                      <InputRightElement h="full">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          color="gray.500"
                          _hover={{ color: "#7d02c4" }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="600">I am a...</FormLabel>
                    <RadioGroup value={role} onChange={(value) => setRole(value as 'student' | 'teacher')}>
                      <HStack spacing={8} justify="center">
                        <Box
                          p={4}
                          borderRadius="12px"
                          border="2px solid"
                          borderColor={role === 'student' ? '#7d02c4' : 'gray.200'}
                          bg={role === 'student' ? 'purple.50' : 'white'}
                          cursor="pointer"
                          transition="all 0.3s"
                          _hover={{ borderColor: '#7d02c4' }}
                          onClick={() => setRole('student')}
                        >
                          <Radio value="student" colorScheme="purple">
                            <Text fontWeight="600">Student</Text>
                          </Radio>
                        </Box>
                        <Box
                          p={4}
                          borderRadius="12px"
                          border="2px solid"
                          borderColor={role === 'teacher' ? '#7d02c4' : 'gray.200'}
                          bg={role === 'teacher' ? 'purple.50' : 'white'}
                          cursor="pointer"
                          transition="all 0.3s"
                          _hover={{ borderColor: '#7d02c4' }}
                          onClick={() => setRole('teacher')}
                        >
                          <Radio value="teacher" colorScheme="purple">
                            <Text fontWeight="600">Teacher</Text>
                          </Radio>
                        </Box>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                  
                  <Button
                    type="submit"
                    bg="#7d02c4"
                    color="white"
                    _hover={{ bg: "#6b019f", transform: "translateY(-2px)" }}
                    _active={{ bg: "#5a0186", transform: "translateY(0)" }}
                    borderRadius="12px"
                    width="full"
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    transition="all 0.3s"
                    isLoading={loading}
                    loadingText="Creating account..."
                  >
                    Create Account
                  </Button>
                  
                  <Divider />
                  
                  <Text textAlign="center" color="gray.600">
                    Already have an account?{' '}
                    <Link 
                      color="#7d02c4" 
                      fontWeight="600"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => navigate('/login')}
                    >
                      Sign in here
                    </Link>
                  </Text>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </Container>
      </Center>
  );
}