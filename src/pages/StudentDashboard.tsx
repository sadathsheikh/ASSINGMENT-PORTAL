import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService, submissionService } from '../services/firebase';
import { Assignment, Submission } from '../types';
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
  Textarea,
  Input,
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
  Flex,
  Divider,
  Image,
  HStack,
  IconButton,
  Grid,
  VStack,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, DeleteIcon, AttachmentIcon } from '@chakra-ui/icons';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionImages, setSubmissionImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        console.log('Loading student dashboard data for user:', currentUser.id);
        
        // Load all assignments
        const allAssignments = await assignmentService.getAllAssignments();
        console.log('All assignments loaded:', allAssignments.length, allAssignments);
        setAssignments(allAssignments as Assignment[]);
        
        // Load student's submissions
        const studentSubs = await submissionService.getStudentSubmissions(currentUser.id);
        console.log('Student submissions loaded:', studentSubs.length, studentSubs);
        setSubmissions(studentSubs as Submission[]);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(`Failed to load assignments: ${err?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser]);
  
  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: 'Invalid file type',
        description: 'Please select only image files (PNG, JPG, GIF, etc.)',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
    
    // Limit to 5 images max
    const totalImages = submissionImages.length + imageFiles.length;
    if (totalImages > 5) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 5 images per submission',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Convert files to base64 for preview and storage
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreviewUrls(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    
    setSubmissionImages(prev => [...prev, ...imageFiles]);
  };
  
  // Remove an image from submission
  const handleRemoveImage = (index: number) => {
    setSubmissionImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Convert images to base64 strings for storage
  const convertImagesToBase64 = async (files: File[]): Promise<string[]> => {
    const base64Images: string[] = [];
    
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      base64Images.push(base64);
    }
    
    return base64Images;
  };

  const handleOpenSubmitModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    
    // Check if there's an existing submission
    const existingSubmission = submissions.find(
      sub => sub.assignmentId === assignment.id
    );
    
    if (existingSubmission) {
      setSubmissionContent(existingSubmission.content);
      // Load existing images if any
      if (existingSubmission.images && existingSubmission.images.length > 0) {
        setImagePreviewUrls(existingSubmission.images);
      } else {
        setImagePreviewUrls([]);
      }
    } else {
      setSubmissionContent('');
      setImagePreviewUrls([]);
    }
    
    setSubmissionImages([]);
    onOpen();
  };
  
  const handleSubmitAssignment = async () => {
    if (!currentUser || !selectedAssignment) return;
    
    if (!submissionContent.trim()) {
      toast({
        title: 'Empty submission',
        description: 'Please enter your submission content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log('Submitting assignment:', {
        studentId: currentUser.id,
        assignmentId: selectedAssignment.id,
        content: submissionContent.substring(0, 50) + '...'
      });
      
      // Convert images to base64 for storage
      const imageData = await convertImagesToBase64(submissionImages);
      const allImages = [...imagePreviewUrls.filter(url => !url.startsWith('data:')), ...imageData];
      
      // Check if submission already exists
      const existingSubmission = await submissionService.getSubmissionByStudentAndAssignment(
        currentUser.id, 
        selectedAssignment.id
      );
      
      if (existingSubmission) {
        // Update existing submission
        console.log('Updating existing submission:', existingSubmission.id);
        await submissionService.updateSubmission(existingSubmission.id, {
          content: submissionContent,
          images: allImages,
          submittedAt: new Date(),
          status: 'submitted'
        });
      } else {
        // Create new submission
        console.log('Creating new submission');
        const submissionId = await submissionService.createSubmission({
          studentId: currentUser.id,
          assignmentId: selectedAssignment.id,
          content: submissionContent,
          images: allImages,
        });
        console.log('Submission created with ID:', submissionId);
      }
      
      // Refresh submissions
      const studentSubs = await submissionService.getStudentSubmissions(currentUser.id);
      console.log('Refreshed submissions:', studentSubs.length);
      setSubmissions(studentSubs as Submission[]);
      
      // Force component re-render by updating assignments state
      setAssignments([...assignments]);
      
      toast({
        title: 'Assignment submitted',
        description: 'Your assignment has been submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      setSubmissionContent('');
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      toast({
        title: 'Submission failed',
        description: `There was an error submitting your assignment: ${err?.message || 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Helper function to check assignment status
  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissions.find(sub => sub.assignmentId === assignment.id);
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (submission) {
      return {
        submitted: true,
        graded: submission.status === 'graded',
        overdue: false,
        submission,
      };
    }
    
    return {
      submitted: false,
      graded: false,
      overdue: dueDate < now,
      submission: null,
    };
  };
  
  // Statistics
  const stats = {
    totalAssignments: assignments.length,
    completedAssignments: submissions.length,
    pendingAssignments: assignments.length - submissions.length,
    averageGrade: submissions.filter(sub => sub.grade !== undefined).length > 0
      ? Math.round(
          submissions
            .filter(sub => sub.grade !== undefined)
            .reduce((sum, sub) => sum + (sub.grade || 0), 0) /
            submissions.filter(sub => sub.grade !== undefined).length
        )
      : 0,
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

  const pendingAssignments = assignments.filter(
    assignment => !submissions.some(sub => sub.assignmentId === assignment.id)
  );
  
  const submittedAssignments = assignments.filter(
    assignment => submissions.some(sub => sub.assignmentId === assignment.id)
  );

  return (
    <Box p={4}>
      <Heading size="xl" mb={6}>Student Dashboard</Heading>
      
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
          <StatLabel>Completed</StatLabel>
          <StatNumber>{stats.completedAssignments}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Pending</StatLabel>
          <StatNumber>{stats.pendingAssignments}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Average Grade</StatLabel>
          <StatNumber>{stats.averageGrade}%</StatNumber>
        </Stat>
      </StatGroup>
      
      <Tabs variant="soft-rounded" colorScheme="purple" bg="white" p={6} borderRadius="16px" boxShadow="md">
        <TabList>
          <Tab>All Assignments</Tab>
          <Tab>Pending</Tab>
          <Tab>Submitted</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            {assignments.length === 0 ? (
              <Center p={10}>
                <Text>No assignments found.</Text>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {assignments.map(assignment => {
                  const status = getAssignmentStatus(assignment);
                  
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
                          {status.submitted ? (
                            status.graded ? (
                              <Badge bg="#10B981" color="white" borderRadius="8px" px={3} py={1}>Graded</Badge>
                            ) : (
                              <Badge bg="#7d02c4" color="white" borderRadius="8px" px={3} py={1}>Submitted</Badge>
                            )
                          ) : status.overdue ? (
                            <Badge bg="#EF4444" color="white" borderRadius="8px" px={3} py={1}>Overdue</Badge>
                          ) : (
                            <Badge bg="#F59E0B" color="white" borderRadius="8px" px={3} py={1}>Pending</Badge>
                          )}
                        </Flex>
                      </CardHeader>
                      
                      <CardBody>
                        <Text mb={3}>{assignment.description}</Text>
                        
                        <Text fontSize="sm" color="gray.500" mb={2}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Text>
                        
                        {assignment.requirements && (
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
                        
                        {status.submission?.grade !== undefined && (
                          <Box mt={3} p={3} bg="green.50" borderRadius="md">
                            <Text fontWeight="bold">
                              Grade: {status.submission.grade}/{assignment.totalPoints}
                            </Text>
                            
                            {status.submission.feedback && (
                              <Box mt={2}>
                                <Text fontSize="sm" fontWeight="bold">Feedback:</Text>
                                <Text fontSize="sm">{status.submission.feedback}</Text>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardBody>
                      
                      <CardFooter>
                        {!status.submitted ? (
                          <Button 
                            bg="#7d02c4"
                            color="white"
                            _hover={{ bg: "#6b019f", transform: "scale(1.05)" }}
                            borderRadius="8px"
                            transition="all 0.2s"
                            onClick={() => handleOpenSubmitModal(assignment)}
                            isDisabled={status.submitted}
                          >
                            Submit Assignment
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            borderColor="#7d02c4"
                            color="#7d02c4"
                            _hover={{ bg: "#7d02c4", color: "white", transform: "scale(1.05)" }}
                            borderRadius="8px"
                            transition="all 0.2s"
                            onClick={() => handleOpenSubmitModal(assignment)}
                          >
                            View Submission
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>
          
          <TabPanel>
            {pendingAssignments.length === 0 ? (
              <Center p={10}>
                <Text>No pending assignments.</Text>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {pendingAssignments.map(assignment => {
                  const dueDate = new Date(assignment.dueDate);
                  const now = new Date();
                  const isOverdue = dueDate < now;
                  
                  return (
                    <Card key={assignment.id} variant="outline" borderColor={isOverdue ? "red.300" : undefined}>
                      <CardHeader pb={0}>
                        <Flex justify="space-between" align="start">
                          <Heading size="md">{assignment.title}</Heading>
                          {isOverdue ? (
                            <Badge colorScheme="red">Overdue</Badge>
                          ) : (
                            <Badge colorScheme="yellow">Pending</Badge>
                          )}
                        </Flex>
                      </CardHeader>
                      
                      <CardBody>
                        <Text mb={3}>{assignment.description}</Text>
                        
                        <Text fontSize="sm" color={isOverdue ? "red.500" : "gray.500"} mb={2}>
                          Due: {dueDate.toLocaleDateString()}
                        </Text>
                        
                        {assignment.requirements && (
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
                      </CardBody>
                      
                      <CardFooter>
                        <Button 
                          bg={isOverdue ? "#EF4444" : "#7d02c4"}
                          color="white"
                          _hover={{ 
                            bg: isOverdue ? "#DC2626" : "#6b019f",
                            transform: "scale(1.05)"
                          }}
                          borderRadius="8px"
                          transition="all 0.2s"
                          onClick={() => handleOpenSubmitModal(assignment)}
                        >
                          Submit Assignment
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>
          
          <TabPanel>
            {submittedAssignments.length === 0 ? (
              <Center p={10}>
                <Text>No submitted assignments.</Text>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {submittedAssignments.map(assignment => {
                  const submission = submissions.find(sub => sub.assignmentId === assignment.id);
                  if (!submission) return null;
                  
                  return (
                    <Card key={assignment.id} variant="outline">
                      <CardHeader pb={0}>
                        <Flex justify="space-between" align="start">
                          <Heading size="md">{assignment.title}</Heading>
                          {submission.status === 'graded' ? (
                            <Badge colorScheme="green">Graded</Badge>
                          ) : (
                            <Badge colorScheme="blue">Submitted</Badge>
                          )}
                        </Flex>
                      </CardHeader>
                      
                      <CardBody>
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          Submitted: {new Date(submission.submittedAt?.toDate?.() || Date.now()).toLocaleString()}
                        </Text>
                        
                        <Box p={3} bg="gray.50" borderRadius="md" mb={3}>
                          <Text fontSize="sm" fontWeight="bold" mb={1}>Your submission:</Text>
                          <Text fontSize="sm">{submission.content}</Text>
                        </Box>
                        
                        {submission.grade !== undefined && (
                          <Box p={3} bg="green.50" borderRadius="md">
                            <Text fontWeight="bold">
                              Grade: {submission.grade}/{assignment.totalPoints}
                            </Text>
                            
                            {submission.feedback && (
                              <Box mt={2}>
                                <Text fontSize="sm" fontWeight="bold">Feedback:</Text>
                                <Text fontSize="sm">{submission.feedback}</Text>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardBody>
                      
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          borderColor="#7d02c4"
                          color="#7d02c4"
                          _hover={{ bg: "#7d02c4", color: "white", transform: "scale(1.05)" }}
                          borderRadius="8px"
                          transition="all 0.2s"
                          onClick={() => handleOpenSubmitModal(assignment)}
                        >
                          View Submission
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Submit Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAssignment?.title}
            <Text fontSize="sm" mt={1} fontWeight="normal" color="gray.500">
              Due: {selectedAssignment && new Date(selectedAssignment.dueDate).toLocaleString()}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <Divider />
          
          <ModalBody py={4}>
            <Text mb={4}>{selectedAssignment?.description}</Text>
            
            {selectedAssignment?.requirements && (
              <Box mb={4}>
                <Text fontWeight="bold" mb={2}>Requirements:</Text>
                <List spacing={1}>
                  {selectedAssignment.requirements.map((req, index) => (
                    <ListItem key={index}>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      {req}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Your Submission</FormLabel>
                <Textarea 
                  value={submissionContent} 
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Enter your submission here..."
                  minH="150px"
                  isDisabled={
                    submissions.find(
                      sub => sub.assignmentId === selectedAssignment?.id
                    )?.status === 'graded'
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>
                  <HStack>
                    <AttachmentIcon />
                    <Text>Upload Images (Optional - Max 5 images)</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  display="none"
                  id="image-upload"
                />
                <Button
                  as="label"
                  htmlFor="image-upload"
                  leftIcon={<AttachmentIcon />}
                  variant="outline"
                  cursor="pointer"
                  mb={3}
                  isDisabled={
                    submissions.find(
                      sub => sub.assignmentId === selectedAssignment?.id
                    )?.status === 'graded'
                  }
                >
                  Choose Images
                </Button>
                
                {imagePreviewUrls.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Selected Images ({imagePreviewUrls.length}/5):
                    </Text>
                    <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={3}>
                      {imagePreviewUrls.map((url, index) => (
                        <Box key={index} position="relative" borderRadius="md" overflow="hidden">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            h="80px"
                            w="100%"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          {submissions.find(sub => sub.assignmentId === selectedAssignment?.id)?.status !== 'graded' && (
                            <IconButton
                              aria-label="Remove image"
                              icon={<DeleteIcon />}
                              size="xs"
                              colorScheme="red"
                              position="absolute"
                              top={1}
                              right={1}
                              onClick={() => handleRemoveImage(index)}
                            />
                          )}
                        </Box>
                      ))}
                    </Grid>
                  </Box>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            {submissions.find(sub => sub.assignmentId === selectedAssignment?.id)?.status !== 'graded' && (
              <Button 
                bg="#7d02c4"
                color="white"
                _hover={{ bg: "#6b019f" }}
                borderRadius="8px"
                onClick={handleSubmitAssignment}
                isLoading={submitting}
                loadingText="Submitting"
              >
                Submit Assignment
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}