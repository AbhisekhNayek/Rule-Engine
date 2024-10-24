# Rule Engine with AST

## Overview

The **Rule Engine with AST** is a simple 3-tier application designed to determine user eligibility based on various attributes such as age, department, income, and experience. The application leverages an Abstract Syntax Tree (AST) to represent conditional rules, allowing for dynamic creation, combination, and modification of these rules.

## Objectives

- Develop a user-friendly interface for rule management.
- Implement an API to handle rule creation, combination, and evaluation.
- Build a backend to manage data storage and processing of rules.

## Features

- **Dynamic Rule Creation**: Users can define rules using a natural language-like syntax.
- **Rule Combination**: The system allows for the combination of multiple rules into a single AST.
- **Rule Evaluation**: Users can evaluate rules against provided user attributes to determine eligibility.
- **Error Handling**: The application implements robust error handling for invalid rules and data formats.
- **Modifiable Rules**: Users can modify existing rules dynamically.

## Data Structure

The application utilizes a Node-based structure to represent the AST:

```javascript
class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type;      
        this.left = left;      
        this.right = right;    
        this.value = value;    
    }
}
```

## Data Storage

### Database Choice

- **MongoDB**: Chosen for its flexibility and support for JSON-like documents.

### Schema

```json
{
    "rules": [
        {
            "rule_id": "string",
            "rule_string": "string",
            "created_at": "date",
            "updated_at": "date"
        }
    ],
    "metadata": {
        "users": [
            {
                "user_id": "string",
                "attributes": {
                    "age": "number",
                    "department": "string",
                    "salary": "number",
                    "experience": "number"
                }
            }
        ]
    }
}
```

## API Design

### Functions

1. **create_rule(rule_string)**: 
   - Converts a string representation of a rule into a Node object representing the AST.

2. **combine_rules(rules)**: 
   - Combines multiple rule strings into a single AST, minimizing redundancy.

3. **evaluate_rule(json_data, data)**: 
   - Evaluates the combined rule's AST against provided user attributes.

### Test Cases

- Create individual rules using `create_rule` and verify their AST representation.
- Combine example rules with `combine_rules` and ensure the resulting AST reflects the combined logic.
- Use sample JSON data to test `evaluate_rule` for various scenarios.
- Explore combining additional rules and test the functionality.



## Installation

To set up the Rule Engine with AST, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/AbhisekhNayek/rule-engine-ast.git
   ```

2. Navigate to the project directory:

   ```bash
   cd rule-engine-ast
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the application:

   ```bash
   npm start
   ```

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please create an issue or submit a pull request.


