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
  Flex,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
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
                <Heading size="lg" fontWeight="700">Welcome Back!</Heading>
                <Text opacity={0.9}>Sign in to your account</Text>
              </VStack>
            </CardHeader>
            
            <CardBody p={8}>
              <form onSubmit={handleLogin}>
                <VStack spacing={6}>
                  {error && (
                    <Alert status="error" borderRadius="12px" bg="red.50" border="1px solid" borderColor="red.200">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}
                  
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
                        placeholder="Enter your password"
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
                    loadingText="Signing in..."
                  >
                    Sign In
                  </Button>
                  
                  <Divider />
                  
                  <Text textAlign="center" color="gray.600">
                    Don't have an account?{' '}
                    <Link 
                      color="#7d02c4" 
                      fontWeight="600"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => navigate('/register')}
                    >
                      Sign up here
                    </Link>
                  </Text>

                  <VStack spacing={2} pt={4}>
                    <Text fontSize="sm" color="gray.500" textAlign="center">Demo Accounts:</Text>
                    <HStack spacing={4} fontSize="xs" color="gray.600">
                      <Text>Teacher: teacher@example.com</Text>
                      <Text>Student: student@example.com</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">Password: password123</Text>
                  </VStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </Container>
      </Center>
  );
}