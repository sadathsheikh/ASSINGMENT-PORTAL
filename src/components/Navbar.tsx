import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Heading,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

interface NavLinkProps {
  children: ReactNode;
  to: string;
}

const NavLink = ({ children, to }: NavLinkProps) => {
  return (
    <Link
      as={RouterLink}
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      to={to}>
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow="sm">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Heading size="md" as={RouterLink} to="/" color="#7d02c4">
            Assignment Portal
          </Heading>
          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}>
            {currentUser ? (
              <>
                <NavLink to="/">Dashboard</NavLink>
                {currentUser.role === 'teacher' && (
                  <>
                    <NavLink to="/assignments">Assignments</NavLink>
                  </>
                )}
                {currentUser.role === 'student' && (
                  <>
                    <NavLink to="/submissions">My Submissions</NavLink>
                  </>
                )}
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </HStack>
        </HStack>
        
        {currentUser ? (
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  name={currentUser.name}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/">Dashboard</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        ) : (
          <Button as={RouterLink} to="/login" colorScheme="blue" size="sm">
            Sign In
          </Button>
        )}
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {currentUser ? (
              <>
                <NavLink to="/">Dashboard</NavLink>
                {currentUser.role === 'teacher' && (
                  <>
                    <NavLink to="/assignments">Assignments</NavLink>
                  </>
                )}
                {currentUser.role === 'student' && (
                  <>
                    <NavLink to="/submissions">My Submissions</NavLink>
                  </>
                )}
                <Button onClick={handleLogout} colorScheme="blue" size="sm" width="100%">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}