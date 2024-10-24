import { useState, useEffect } from 'react';
import {
    Input, Button, Card, CardBody, Text, Checkbox, Stack, Flex, Heading, Menu, MenuButton, MenuList, MenuItem,
    Popover, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton, Portal,
    InputGroup, InputRightElement, IconButton, Tooltip
} from '@chakra-ui/react';
import { ChevronDownIcon, CloseIcon, EditIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import axios from 'axios';

function Home() {
    const [rules, setRules] = useState([]);
    const [ruleName, setRuleName] = useState('');
    const [newRule, setNewRule] = useState('');
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRule, setSelectedRule] = useState(null);
    const [inputValue, setInputValue] = useState({});
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [popoverOpen, setPopoverOpen] = useState(null);
    const [editRuleIndex, setEditRuleIndex] = useState(null);
    const [editRuleName, setEditRuleName] = useState('');
    const [editRuleValue, setEditRuleValue] = useState('');
    const [dynamicInputs, setDynamicInputs] = useState([]);

    const parseParams = (params) => {
        const uniqueKeys = new Set();
        JSON.parse(params).forEach(param => {
            Object.keys(param).forEach(key => {
                if (key !== 'type') {
                    uniqueKeys.add(key);
                }
            });
        });
        return Array.from(uniqueKeys);
    };

    const fetchParams = async (index) => {
        const ruleId = rules[index].id;
        try {
            const response = await axios.get(`https://rengine-umber.vercel.app/api/v1/rule/${ruleId}`);
            if (response.data.success) {
                setDynamicInputs(parseParams(response.data.data.params));
            } else {
                console.error("Failed to fetch params:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching params:", error);
        }
    };

    const addRule = () => {
        if (ruleName.trim() !== '' && newRule.trim() !== '') {
            // Define the rule object
            const ruleData = {
                name: ruleName,
                ruleString: newRule
            };

            // Make a POST request to add the new rule
            axios.post("https://rengine-umber.vercel.app/api/v1/rule/list/", ruleData)
                .then(response => {
                    if (response.data.success) {
                        // Successfully added, update the rules state
                        setRules([...rules, { name: ruleName, rule: newRule, id: response.data.data._id, isCombined: response.data.data.isCombined }]);
                        setRuleName('');
                        setNewRule('');
                        setUpdateList((prev) => !prev);
                        console.log(JSON.parse(response.data.data.AST));
                    } else {
                        console.error("Failed to add rule:", response.data.message);
                    }
                })
                .catch(error => {
                    console.error("Error adding rule:", error);
                });
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            addRule();
        }
    };

    const toggleCheckboxes = () => {
        if (rules.length === 0) {
            alert('No rules found to combine.');
            return;
        }
        if (showCheckboxes) {
            combineRules();
        }
        setShowCheckboxes(!showCheckboxes);
    };

    const combineRules = async () => {
        try {
            // Collect the rule text for combining based on selected checkboxes
            const combinedRule = rules
                .filter((_, index) => document.getElementById(`checkbox-${index}`)?.checked)
                .map(rule => rule.rule)  // Extract the rule text for combining
                .join(' # ');

            const combinedData = {
                name: ruleName,
                ruleString: combinedRule
            };

            // Make the POST request to combine rules
            const response = await axios.post("https://rengine-umber.vercel.app/api/v1/rule/combine/", combinedData);

            if (response.data.success) {
                const combinedRuleData = response.data.data;

                // Update the rules state with the new combined rule
                const combinedRules = rules
                    .filter((_, index) => !document.getElementById(`checkbox-${index}`)?.checked) // Keep non-combined rules
                    .concat({
                        _id: combinedRuleData._id,
                        name: combinedRuleData.name,
                        isCombined: combinedRuleData.isCombined,
                        rule: combinedRuleData.ruleString[0], // Assuming ruleString is an array with one item
                        // You can add other properties if needed
                    });

                // Update the state with the new list of rules
                setRules(combinedRules);
                setRuleName('');
                setUpdateList((prev) => !prev);
                console.log(JSON.parse(response.data.data.AST));
            } else {
                console.error("Failed to add rule:", response.data.message);
            }
        } catch (error) {
            console.error("Error adding rule:", error);
        }
    };


    const cancelCombining = () => {
        setShowCheckboxes(false);

        rules.forEach((_, index) => {
            const checkbox = document.getElementById(`checkbox-${index}`);
            if (checkbox) checkbox.checked = false;
        });
    };

    const handleEvaluate = (rule, index) => {
        fetchParams(index);
        setSelectedRule(rule);
        setPopoverOpen(index);
    };

    const handleVerify = async () => {
        if (selectedRule && selectedRule.id) {
            const ruleId = selectedRule.id;
            const jsonData = JSON.stringify(inputValue);

            try {
                const response = await axios.post(`https://rengine-umber.vercel.app/api/v1/rule/verify/${ruleId}`, jsonData, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (response.data && typeof response.data.isValid === 'boolean') {
                    setEvaluationResult(response.data.isValid ? 'True' : 'False');
                } else {
                    console.error('Unexpected response format:', response.data);
                }
            } catch (error) {
                console.error('Error verifying data:', error);
            }
        } else {
            console.error('No selected rule to verify.');
        }
    };


    const closePopover = () => {
        setPopoverOpen(null);
        setEvaluationResult(null);
    };

    const handleEdit = (index) => {
        setEditRuleIndex(index);
        setEditRuleName(rules[index]?.name || '');
        setEditRuleValue(rules[index]?.rule || '');
    };

    const saveEditedRule = async () => {
        if (editRuleIndex !== null) {
            const ruleId = rules[editRuleIndex].id;
            const updatedRule = { name: editRuleName, ruleString: editRuleValue };
            try {
                // Send PUT request to update the rule on the server
                await axios.put(`https://rengine-umber.vercel.app/api/v1/rule/${ruleId}`, updatedRule);

                // Update local state with the new rule
                const updatedRules = [...rules];
                updatedRules[editRuleIndex] = { ...updatedRules[editRuleIndex], name: editRuleName, rule: editRuleValue };
                setRules(updatedRules);
                setUpdateList((prev) => !prev);
            } catch (error) {
                console.error('Failed to update rule:', error);
            }

            // Reset editing state
            setEditRuleIndex(null);
            setEditRuleName('');
            setEditRuleValue('');
        }
    };

    const handleDelete = (index) => {
        const ruleId = rules[index]?.id;

        if (!ruleId) {
            console.error("Invalid rule ID:", ruleId);
            return;
        }

        // Make DELETE request to remove the rule
        axios.delete(`https://rengine-umber.vercel.app/api/v1/rule/${ruleId}`)
            .then(response => {
                if (response.data.success) {
                    // Update local state to remove the deleted rule
                    const updatedRules = rules.filter((_, i) => i !== index);
                    setRules(updatedRules);
                    setUpdateList((prev) => !prev);
                } else {
                    console.error("Failed to delete rule:", response.data.message);
                }
            })
            .catch(error => {
                console.error("Error deleting rule:", error);
            });
    };



    useEffect(() => {
        axios.get("https://rengine-umber.vercel.app/api/v1/rule/list/")
            .then(response => {
                if (response.data.success && Array.isArray(response.data.data)) {
                    const rulesData = response.data.data.map((item, index) => ({
                        name: item.name,
                        rule: item.ruleString[0],
                        id: response.data.data[index]._id,
                        isCombined: item.isCombined
                    }));
                    setRules(rulesData);
                } else {
                    console.error("Unexpected response structure:", response);
                }
            })
            .catch(error => {
                console.error("Error fetching rules:", error);
            });
    }, [updateList]);



    const filteredRules = rules.filter(rule => {
        const nameMatch = rule.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const ruleMatch = filter === 'All' ||
            (filter === 'Primitive' && !rule.isCombined) ||
            (filter === 'Combined' && rule.isCombined);

        return nameMatch && ruleMatch;
    });

    const hasPrimitiveRules = rules.filter(rule => !rule.isCombined).length >= 2;
    const hasCombinedRules = rules.filter(rule => rule.isCombined).length >= 2;


    return (
        <div className='grid place-items-center w-screen gap-8 bg-gray-900 '>
            <div className='w-full max-w-3xl shadow-lg shadow-black m-2 p-3 border-transparent'>
                <Flex
                    direction='column'
                    align='center'
                    justify='center'
                    gap={4}
                >
                    {/* <Heading
                        size='xl'
                        textColor='teal.400'
                        textAlign='center'
                        mb={4}
                        textTransform='uppercase'
                    >
                        Create the Rule
                    </Heading> */}
                    <Stack
                        spacing={4}
                        direction={{ base: 'column', md: 'row' }}
                        align='center'
                        w='full'
                        maxW={{ base: '90%', md: '500px' }}
                    >
                        <Input
                            focusBorderColor='teal.400'
                            width={{ base: '100%', md: '30%' }}
                            placeholder='Name'
                            title='Rule Name/Identifier'
                            size='lg'
                            value={ruleName}
                            onChange={(e) => setRuleName(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <Input
                            focusBorderColor='teal.400'
                            placeholder='Enter the rule'
                            size='lg'
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            onKeyDown={handleKeyDown}
                            width={{ base: '100%', md: '100%' }}
                        />
                        <Button
                            colorScheme='teal'
                            size='lg'
                            onClick={addRule}
                            width={{ base: '100%', md: 'auto' }}
                        >
                            Create
                        </Button>
                    </Stack>
                </Flex>
            </div>
            <div className='w-4/5 max-w-3xl border-t-2 mt-20 border-gray pt-4 shadow-lg shadow-black m-0.5 border-transparent'>
                <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }} align={{ base: 'space-between', md: 'center' }}>
                    <Flex justify='space-between' align='center' flex='1'>
                        <Heading size='xl' textColor='teal.400'>Rules</Heading>
                        <Menu>
                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                                {filter}
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={() => setFilter('All')}>All</MenuItem>
                                <MenuItem onClick={() => setFilter('Primitive')}>Primitive</MenuItem>
                                <MenuItem onClick={() => setFilter('Combined')}>Combined</MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                    <InputGroup width='auto' maxW='300px'>
                        <Input
                            placeholder='Search by name...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputRightElement>
                            <IconButton
                                size='sm'
                                icon={<CloseIcon />}
                                onClick={() => setSearchTerm('')}
                                aria-label='Clear search'
                                variant='ghost'
                                color='gray.500'
                            />
                        </InputRightElement>
                    </InputGroup>
                </Flex>
                {filteredRules.length === 0 ? (
                    <Text textAlign='center' marginTop='5rem' color='red'>
                        No {filter === 'All' ? 'rules' : filter.toLowerCase()} found, please create one.
                    </Text>
                ) : (
                    <div className='grid place-items-center shadow-lg shadow-black m-0.5 border-transparent'>
                        {popoverOpen !== null && (
                            <Popover isOpen={(prev) => !prev} onClose={closePopover} placement="right">
                                <Portal>
                                    <PopoverContent position='fixed' right={{ base: '2rem', md: '4rem' }} top='30%'>
                                        <PopoverArrow />
                                        <PopoverHeader>{selectedRule.name}</PopoverHeader>
                                        <PopoverCloseButton />
                                        <PopoverBody>
                                            {dynamicInputs.map((inputKey, i) => (
                                                <Input
                                                    key={i}
                                                    placeholder={`Enter ${inputKey}`}
                                                    value={inputValue[inputKey] || ''}
                                                    onChange={(e) => setInputValue({ ...inputValue, [inputKey]: e.target.value })}
                                                    mb={3}
                                                />
                                            ))}
                                            <Button colorScheme='teal' onClick={handleVerify} size='md'>Verify</Button>
                                            <Text mt={2} color={evaluationResult === 'Accepted' ? 'green.400' : evaluationResult === 'Declined' ? 'red.500' : 'black'}>
                                                Result: {evaluationResult !== null ? evaluationResult : 'Click Verify'}
                                            </Text>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Portal>
                            </Popover>
                        )}
                        {filteredRules.map((rule, index) => (
                            <Card
                                key={index}
                                mb={4}
                                bg='gray.800' 
                                boxShadow='lg' 
                                width={{ base: '100%', md: '100%' }}
                            >
                                <CardBody>
                                    <Stack direction='column'>
                                        <Text fontSize='sm' color='white'> 
                                            {rule.name}
                                        </Text>
                                        <Text wordBreak='break-word' color='gray.100'> 
                                            {rule.rule}
                                        </Text>
                                        <Stack direction='row' justify='flex-end' align='center' mt={2}>
                                            <Tooltip label='Delete'>
                                                <IconButton
                                                    icon={<DeleteIcon />}
                                                    onClick={() => handleDelete(index)}
                                                    aria-label='Delete Rule'
                                                    variant='outline'
                                                    size='sm'
                                                    colorScheme='red' 
                                                />
                                            </Tooltip>
                                            <Tooltip label='Edit'>
                                                <IconButton
                                                    icon={<EditIcon />}
                                                    onClick={() => handleEdit(index)}
                                                    aria-label='Edit Rule'
                                                    variant='outline'
                                                    size='sm'
                                                    colorScheme='blue' 
                                                />
                                            </Tooltip>
                                            <Tooltip label='Verify'>
                                                <IconButton
                                                    icon={<CheckIcon />}
                                                    onClick={() => handleEvaluate(rule, index)}
                                                    aria-label='Verify Rule'
                                                    variant='outline'
                                                    size='sm'
                                                    colorScheme='green' // Optional: change color scheme for better visibility
                                                />
                                            </Tooltip>
                                            {showCheckboxes && (
                                                <Checkbox
                                                    id={`checkbox-${index}`}
                                                    size='lg'
                                                />
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}


                <Flex mt={4} gap={2} justify='center'>
                    {(filter === 'All' && rules.length >= 2 && !showCheckboxes) ||
                        (filter === 'Primitive' && hasPrimitiveRules && !showCheckboxes) ||
                        (filter === 'Combined' && hasCombinedRules && !showCheckboxes) ? (
                        <Button colorScheme='teal' size='md' onClick={toggleCheckboxes}>
                            Select to Combine
                        </Button>
                    ) : showCheckboxes && (
                        <Flex
                            direction={{ base: 'column', md: 'row' }}
                            width={{ base: '100%', md: 'auto' }}
                            gap={2}
                            align='center'
                        >
                            <Input
                                focusBorderColor='teal.400'
                                width={{ base: '80%', md: 'auto' }}
                                type="text"
                                value={ruleName}
                                onChange={(e) => setRuleName(e.target.value)}
                                placeholder="Name"
                            />
                            <Button colorScheme='teal' size='md' onClick={toggleCheckboxes}>
                                Combine
                            </Button>
                            <Button colorScheme='red' size='md' onClick={cancelCombining}>
                                Cancel
                            </Button>
                        </Flex>
                    )}
                </Flex>

            </div>
            {editRuleIndex !== null && (
                <Popover isOpen={(prev) => !prev} onClose={() => setEditRuleIndex(null)}>
                    <Portal>
                        <PopoverContent position='fixed' right={{ base: '2rem', md: '4rem' }} top='30%'>
                            <PopoverArrow />
                            <PopoverHeader>{editRuleName}</PopoverHeader>
                            <PopoverCloseButton />
                            <PopoverBody>
                                <Input
                                    placeholder='Rule Name'
                                    value={editRuleName}
                                    onChange={(e) => setEditRuleName(e.target.value)}
                                    mb={3}
                                />
                                <Input
                                    placeholder='Enter the rule'
                                    value={editRuleValue}
                                    onChange={(e) => setEditRuleValue(e.target.value)}
                                    mb={3}
                                />
                                <Button colorScheme='teal' onClick={saveEditedRule} size='md'>Save</Button>
                            </PopoverBody>
                        </PopoverContent>
                    </Portal>
                </Popover>
            )}

        </div>
    );
}

export default Home;
