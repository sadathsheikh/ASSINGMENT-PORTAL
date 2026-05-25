import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService, submissionService, userService } from '../services/firebase';
import { Assignment, Submission, User } from '../types';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Textarea,
  useToast,
  Spinner,
  Center,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Flex,
  Divider,
  HStack,
  VStack,
  Image,
} from '@chakra-ui/react';
import { CheckCircleIcon, DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';

export default function TeacherDashboard() {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states for creating/editing assignments
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [requirements, setRequirements] = useState<string[]>(['']);
  
  // Form states for grading
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  
  // Modal controls
  const assignmentModal = useDisclosure();
  const submissionModal = useDisclosure();
  const deleteModal = useDisclosure();
  
  const toast = useToast();
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        console.log('Loading teacher dashboard data for user:', currentUser.id);
        
        // Load ALL assignments first to debug
        const allAssignments = await assignmentService.getAllAssignments();
        console.log('All assignments in database:', allAssignments.length, allAssignments);
        
        // Load teacher's assignments
        const teacherAssignments = await assignmentService.getTeacherAssignments(currentUser.id);
        console.log('Teacher assignments for current user:', teacherAssignments.length, teacherAssignments);
        setAssignments(teacherAssignments as Assignment[]);
        
        // Load all students
        const allStudents = await userService.getAllStudents();
        console.log('Students loaded:', allStudents.length);
        setStudents(allStudents as User[]);
        
        // Load all submissions for teacher's assignments
        const allSubmissions: Submission[] = [];
        for (const assignment of teacherAssignments as Assignment[]) {
          const assignmentSubmissions = await submissionService.getSubmissionsByAssignment(assignment.id);
          console.log(`Submissions for assignment ${assignment.id}:`, assignmentSubmissions.length);
          allSubmissions.push(...assignmentSubmissions as Submission[]);
        }
        
        console.log('Total submissions loaded:', allSubmissions.length);
        setSubmissions(allSubmissions as Submission[]);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(`Failed to load assignments: ${err?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser]);
  
  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };
  
  const handleUpdateRequirement = (index: number, value: string) => {
    const updatedRequirements = [...requirements];
    updatedRequirements[index] = value;
    setRequirements(updatedRequirements);
  };
  
  const handleRemoveRequirement = (index: number) => {
    if (requirements.length > 1) {
      const updatedRequirements = requirements.filter((_, i) => i !== index);
      setRequirements(updatedRequirements);
    }
  };
  
  const handleCreateAssignment = async () => {
    if (!currentUser) return;
    
    // Validate inputs
    if (!title.trim() || !description.trim() || !dueDate || totalPoints <= 0) {
      toast({
        title: 'Invalid inputs',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      // Filter out empty requirements
      const filteredRequirements = requirements.filter(req => req.trim() !== '');
      
      await assignmentService.createAssignment({
        title,
        description,
        dueDate,
        totalPoints,
        requirements: filteredRequirements,
        createdBy: currentUser.id,
      });
      
      // Refresh assignments
      const teacherAssignments = await assignmentService.getTeacherAssignments(currentUser.id);
      setAssignments(teacherAssignments as Assignment[]);
      
      toast({
        title: 'Assignment created',
        description: 'Your assignment has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setTotalPoints(100);
      setRequirements(['']);
      
      assignmentModal.onClose();
    } catch (err) {
      console.error('Error creating assignment:', err);
      toast({
        title: 'Failed to create assignment',
        description: 'There was an error creating your assignment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleViewSubmission = (submission: Submission) => {
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    if (assignment) {
      setSelectedAssignment(assignment);
      setSelectedSubmission(submission);
      setGrade(submission.grade || 0);
      setFeedback(submission.feedback || '');
      submissionModal.onOpen();
    }
  };
  
  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      await submissionService.gradeSubmission(selectedSubmission.id, grade, feedback);
      
      // Refresh submissions
      const updatedSubmissions = [...submissions];
      
      // Replace the updated submissions
      const submissionIndex = updatedSubmissions.findIndex(s => s.id === selectedSubmission.id);
      if (submissionIndex !== -1) {
        updatedSubmissions[submissionIndex] = {
          ...updatedSubmissions[submissionIndex],
          grade,
          feedback,
          status: 'graded',
        };
      }
      
      setSubmissions(updatedSubmissions);
      
      toast({
        title: 'Submission graded',
        description: 'The submission has been graded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      submissionModal.onClose();
    } catch (err) {
      console.error('Error grading submission:', err);
      toast({
        title: 'Failed to grade submission',
        description: 'There was an error grading the submission. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      await assignmentService.deleteAssignment(selectedAssignment.id);
      
      // Remove the assignment from state
      setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
      
      // Remove related submissions
      setSubmissions(submissions.filter(s => s.assignmentId !== selectedAssignment.id));
      
      toast({
        title: 'Assignment deleted',
        description: 'The assignment has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      deleteModal.onClose();
    } catch (err) {
      console.error('Error deleting assignment:', err);
      toast({
        title: 'Failed to delete assignment',
        description: 'There was an error deleting the assignment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openDeleteModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    deleteModal.onOpen();
  };
  
  // Stats for the dashboard
  const stats = {
    totalAssignments: assignments.length,
    pendingGrading: submissions.filter(s => s.status !== 'graded').length,
    totalStudents: students.length,
    totalSubmissions: submissions.length,
  };
  
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };
  
  if (loading) {
    return (
      <Center h="100vh">
        <Stack spacing={4} align="center">
          <Spinner size="xl" />
          <Text>Loading dashboard...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box p={4}>
      <Heading size="xl" mb={6}>Teacher Dashboard</Heading>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <StatGroup mb={6}>
        <Stat>
          <StatLabel>Total Assignments</StatLabel>
          <StatNumber>{stats.totalAssignments}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Pending Grading</StatLabel>
          <StatNumber>{stats.pendingGrading}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Total Students</StatLabel>
          <StatNumber>{stats.totalStudents}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Total Submissions</StatLabel>
          <StatNumber>{stats.totalSubmissions}</StatNumber>
        </Stat>
      </StatGroup>
      
      <Button 
        leftIcon={<AddIcon />} 
        bg="#7d02c4"
        color="white"
        _hover={{ bg: "#6b019f", transform: "translateY(-2px)", boxShadow: "lg" }}
        _active={{ bg: "#5a0186" }}
        borderRadius="12px"
        px={8}
        py={6}
        fontSize="md"
        fontWeight="600"
        transition="all 0.3s"
        onClick={() => {
          setTitle('');
          setDescription('');
          setDueDate('');
          setTotalPoints(100);
          setRequirements(['']);
          assignmentModal.onOpen();
        }}
        mb={6}
      >
        Create Assignment
      </Button>
      
      <Tabs variant="soft-rounded" colorScheme="purple" bg="white" p={6} borderRadius="16px" boxShadow="md">
        <TabList>
          <Tab>Assignments</Tab>
          <Tab>Submissions</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            {assignments.length === 0 ? (
              <Center p={10}>
                <Text>No assignments created yet.</Text>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {assignments.map(assignment => {
                  const assignmentSubmissions = submissions.filter(
                    sub => sub.assignmentId === assignment.id
                  );
                  
                  const pendingGrading = assignmentSubmissions.filter(
                    sub => sub.status !== 'graded'
                  ).length;
                  
                  return (
                    <Card 
                      key={assignment.id} 
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
                    >
                      <CardHeader pb={0}>
                        <Flex justify="space-between" align="start">
                          <Heading size="md" color="#7d02c4">{assignment.title}</Heading>
                          <IconButton
                            aria-label="Delete assignment"
                            icon={<DeleteIcon />}
                            size="sm"
                            bg="red.50"
                            color="red.500"
                            _hover={{ bg: "red.100" }}
                            borderRadius="8px"
                            onClick={() => openDeleteModal(assignment)}
                          />
                        </Flex>
                      </CardHeader>
                      
                      <CardBody>
                        <Text mb={3}>{assignment.description}</Text>
                        
                        <Text fontSize="sm" color="gray.500" mb={2}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Text>
                        
                        {assignment.requirements && assignment.requirements.length > 0 && (
                          <Box mt={2}>
                            <Text fontSize="sm" fontWeight="bold">Requirements:</Text>
                            <List spacing={1} mt={1}>
                              {assignment.requirements.map((req, index) => (
                                <ListItem key={index} fontSize="sm">
                                  <ListIcon as={CheckCircleIcon} color="green.500" />
                                  {req}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        <Badge bg="#7d02c4" color="white" borderRadius="8px" px={3} py={1} mt={3}>
                          Total Points: {assignment.totalPoints}
                        </Badge>
                      </CardBody>
                      
                      <CardFooter>
                        <Stack spacing={4} width="100%">
                          <Text fontSize="sm">
                            {assignmentSubmissions.length} submission(s), {pendingGrading} pending grading
                          </Text>
                          
                          {assignmentSubmissions.length > 0 && (
                            <Box width="100%" overflowX="auto">
                              <Table size="sm" variant="simple">
                                <Thead>
                                  <Tr>
                                    <Th>Student</Th>
                                    <Th>Status</Th>
                                    <Th>Action</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {assignmentSubmissions.map(sub => (
                                    <Tr key={sub.id}>
                                      <Td>{getStudentName(sub.studentId)}</Td>
                                      <Td>
                                        {sub.status === 'graded' ? (
                                          <Badge colorScheme="green">Graded: {sub.grade}/{assignment.totalPoints}</Badge>
                                        ) : (
                                          <Badge colorScheme="yellow">Pending</Badge>
                                        )}
                                      </Td>
                                      <Td>
                                        <Button 
                                          size="xs"
                                          bg="#7d02c4"
                                          color="white"
                                          _hover={{ bg: "#6b019f" }}
                                          borderRadius="6px"
                                          onClick={() => handleViewSubmission(sub)}
                                        >
                                          View
                                        </Button>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          )}
                        </Stack>
                      </CardFooter>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>
          
          <TabPanel>
            {submissions.length === 0 ? (
              <Center p={10}>
                <Text>No submissions yet.</Text>
              </Center>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Student</Th>
                    <Th>Assignment</Th>
                    <Th>Submission Date</Th>
                    <Th>Status</Th>
                    <Th>Grade</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {submissions.map(submission => {
                    const assignment = assignments.find(a => a.id === submission.assignmentId);
                    return (
                      <Tr key={submission.id}>
                        <Td>{getStudentName(submission.studentId)}</Td>
                        <Td>{assignment?.title || 'Unknown'}</Td>
                        <Td>{new Date(submission.submittedAt?.toDate?.() || Date.now()).toLocaleString()}</Td>
                        <Td>
                          {submission.status === 'graded' ? (
                            <Badge colorScheme="green">Graded</Badge>
                          ) : (
                            <Badge colorScheme="yellow">Pending</Badge>
                          )}
                        </Td>
                        <Td>
                          {submission.grade !== undefined ? (
                            `${submission.grade}/${assignment?.totalPoints || 100}`
                          ) : (
                            '-'
                          )}
                        </Td>
                        <Td>
                          <Button 
                            size="sm"
                            bg="#7d02c4"
                            color="white"
                            _hover={{ bg: "#6b019f", transform: "scale(1.05)" }}
                            borderRadius="8px"
                            transition="all 0.2s"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            {submission.status === 'graded' ? 'View' : 'Grade'}
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Create Assignment Modal */}
      <Modal isOpen={assignmentModal.isOpen} onClose={assignmentModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Assignment</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Assignment Title"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the assignment"
                  minH="100px"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Total Points</FormLabel>
                <NumberInput
                  value={totalPoints}
                  onChange={(_, val) => setTotalPoints(val)}
                  min={1}
                  max={1000}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>
                  Requirements
                  <Button
                    size="xs"
                    leftIcon={<AddIcon />}
                    ml={2}
                    onClick={handleAddRequirement}
                  >
                    Add
                  </Button>
                </FormLabel>
                
                {requirements.map((req, index) => (
                  <HStack key={index} mb={2}>
                    <Input
                      value={req}
                      onChange={(e) => handleUpdateRequirement(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                    />
                    
                    {requirements.length > 1 && (
                      <IconButton
                        aria-label="Remove requirement"
                        icon={<DeleteIcon />}
                        size="sm"
                        onClick={() => handleRemoveRequirement(index)}
                      />
                    )}
                  </HStack>
                ))}
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={assignmentModal.onClose}>
              Cancel
            </Button>
            <Button 
              bg="#7d02c4"
              color="white"
              _hover={{ bg: "#6b019f" }}
              borderRadius="8px"
              onClick={handleCreateAssignment}
            >
              Create Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* View/Grade Submission Modal */}
      <Modal isOpen={submissionModal.isOpen} onClose={submissionModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Submission for {selectedAssignment?.title}
            <Text fontSize="sm" mt={1} fontWeight="normal" color="gray.500">
              By {selectedSubmission ? getStudentName(selectedSubmission.studentId) : ''}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <Divider />
          
          <ModalBody py={4}>
            <Box mb={4}>
              <Text fontSize="sm" fontWeight="bold">Submitted:</Text>
              <Text fontSize="sm">
                {selectedSubmission ? new Date(selectedSubmission.submittedAt?.toDate?.() || Date.now()).toLocaleString() : ''}
              </Text>
            </Box>
            
            <Box p={4} bg="gray.50" borderRadius="md" mb={6}>
              <Text fontSize="sm" fontWeight="bold" mb={1}>Submission Content:</Text>
              <Text whiteSpace="pre-wrap">{selectedSubmission?.content || ''}</Text>
              
              {selectedSubmission?.images && selectedSubmission.images.length > 0 && (
                <Box mt={4}>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Submitted Images ({selectedSubmission.images.length}):</Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {selectedSubmission.images.map((imageUrl: string, index: number) => (
                      <Box key={index} borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                        <Image
                          src={imageUrl}
                          alt={`Submission image ${index + 1}`}
                          w="100%"
                          h="150px"
                          objectFit="cover"
                          cursor="pointer"
                          onClick={() => window.open(imageUrl, '_blank')}
                          _hover={{ opacity: 0.8, transform: 'scale(1.02)' }}
                          transition="all 0.3s"
                        />
                        <Text fontSize="xs" p={2} bg="white" textAlign="center" color="gray.600">
                          Image {index + 1} - Click to enlarge
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </Box>
            
            <Divider my={4} />
            
            <FormControl mb={4}>
              <FormLabel>Grade (out of {selectedAssignment?.totalPoints || 100})</FormLabel>
              <NumberInput
                value={grade}
                onChange={(_, val) => setGrade(val)}
                min={0}
                max={selectedAssignment?.totalPoints || 100}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Feedback</FormLabel>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to the student"
                minH="100px"
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={submissionModal.onClose}>
              Close
            </Button>
            <Button 
              bg="#7d02c4"
              color="white"
              _hover={{ bg: "#6b019f" }}
              borderRadius="8px"
              onClick={handleGradeSubmission}
            >
              Save Grade
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Assignment Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Assignment</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Text>
              Are you sure you want to delete the assignment "{selectedAssignment?.title}"?
              This will also delete all student submissions for this assignment.
            </Text>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteAssignment}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}