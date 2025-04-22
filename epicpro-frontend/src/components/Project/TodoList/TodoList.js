import React, { Component } from 'react'
import { connect } from 'react-redux';

class TodoList extends Component {
    constructor(props) {
		super(props);
		this.state = {
			todos: [],
            employees: [],
			showAddTodoModal: false,
            selectedEmployeeId: '',
			logged_in_employee_id: null,
            logged_in_employee_role: null,
			title: "",
			due_date: "",
            priority: "",
            todoStatus: "",
			errors: {
				title: '',
        		due_date: '',
                priority: '',
                todoStatus: '',
                selectedEmployeeId: '',
			},
			successMessage: "",
      		errorMessage: "",
			showSuccess: false,
      		showError: false,
			loading: true
		}
	}

    componentDidMount() {
        const {role} = window.user;
		// Get the logged in user id
		this.setState({
			logged_in_employee_id: window.user.id,
            logged_in_employee_role: window.user.role
		});

		// Make the GET API call when the component is mounted
		fetch(`${process.env.REACT_APP_API_URL}/project_todo.php?action=view&logged_in_employee_id=${window.user.id}&role=${window.user.role}`, {
			method: "GET",
		})
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				const todoData = data.data;
				this.setState({
					todos: todoData,
					loading: false
				});
			} else {
			  	this.setState({ message: data.message, loading: false });
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data', loading: false });
			console.error(err);
		});


        // Check if user is admin or superadmin
        if (role === 'admin' || role === 'super_admin') {
            // Fetch employees data if user is admin or super_admin
            fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&role=employee`, {
                method: "GET",
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.setState({
                        employees: data.status === 'success' ? data.data : [],
                        loading: false
                    });
                } else {
                    this.setState({ error: data.message, loading: false });
                }
            })
            .catch(err => {
                this.setState({ error: 'Failed to fetch employees data' });
                console.error(err);
            });
        }
	}

    // Handle input changes for add todo
	handleInputChangeForAddTodo = (todo) => {
        const { name, value } = todo.target;
        this.setState({
			[name]: value,
			errors: { ...this.state.errors, [name]: "" } // Clear error for this field
		});
    };

    // Validate Add Department Form
	validateAddTodoForm = (e) => {
		const { title, due_date, priority, todoStatus, selectedEmployeeId, logged_in_employee_role } = this.state;
        let errors = {};
        let isValid = true;

        // title validation (only letters and spaces)
        const namePattern = /^[a-zA-Z\s.,!?'-]+$/;
        if (!title.trim()) {
            errors.title = "Please enter a todo title.";
            isValid = false;
        } else if (!namePattern.test(title)) {
            errors.title = "Todo title can only contain letters, spaces, and punctuation.";
            isValid = false;
        }

        // Due date validation
        if (!due_date.trim()) {
            errors.due_date = "Please select a due date.";
            isValid = false;
        } else {
            const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
            if (due_date < today) {
                errors.due_date = "Due date cannot be in the past.";
                isValid = false;
            }
        }

        // Todo Priority validation
        if (!priority.trim()) {
            errors.priority = "Please select todo priority.";
            isValid = false;
        }

        // Todo Status validation
        if (!todoStatus.trim()) {
            errors.todoStatus = "Please select todo status.";
            isValid = false;
        }

        // Employee selection validation (only for admin/super_admin)
        if ((logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && !selectedEmployeeId.trim()) {
            errors.selectedEmployeeId = "Please select an employee to assign todo.";
            isValid = false;
        }

        this.setState({ errors });
        return isValid;
	};

    // Add Todo data API call
    addTodoData = () => {
		const { logged_in_employee_id, logged_in_employee_role, title, due_date, priority, todoStatus, selectedEmployeeId } = this.state;

        if (!this.validateAddTodoForm()) {
            return; // Stop execution if validation fails
        }

        // Determine the correct employee_id
        const employee_id = (logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") 
        ? selectedEmployeeId 
        : logged_in_employee_id;

        const addTodoFormData = new FormData();
        addTodoFormData.append('employee_id', employee_id);
        addTodoFormData.append('title', title);
        addTodoFormData.append('due_date', due_date);
        addTodoFormData.append('priority', priority);
        addTodoFormData.append('status', todoStatus);
        addTodoFormData.append('logged_in_employee_id', logged_in_employee_id);
        addTodoFormData.append('logged_in_employee_role', logged_in_employee_role);

        // API call to add department
        fetch(`${process.env.REACT_APP_API_URL}/project_todo.php?action=add`, {
            method: "POST",
            body: addTodoFormData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 'success') {
                // Update the department list
                this.setState((prevState) => ({
                    todos: [data.data, ...(prevState.todos || [])],
                    title: "",
                    due_date: "",
                    priority: "",
                    todoStatus: "",
                    selectedEmployeeId: "",
                    errors:{},
                    successMessage: "Todo added successfully!",
                    showSuccess: true,
                }));
                // Close the modal
                document.querySelector("#addTodoModal .close").click();

				// Auto-hide success message after 5 seconds
				setTimeout(() => {
					this.setState({
						showSuccess: false, 
						successMessage: ''
					});
				}, 3000);
            } else {
                this.setState({
                    errorMessage: "Failed to add Todo. Please try again.",
                    showError: true,
                });

                this.setState({
                    showError: false,
                    errorMessage: ''
                });
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: "An error occurred while adding the todo.",
                showError: true,
            });
        });
    };

    // Reset form errors when modal is closed
    resetFormErrors = () => {
        this.setState({
            errors: {},
            title: "",
            due_date: "",
            priority: "",
            todoStatus: "",
            selectedEmployeeId: ""
        });
    };

    // Render function for Bootstrap toast messages
    renderAlertMessages = () => {
        return (
            
            <>
                {/* Add the alert for success messages */}
                <div 
                    className={`alert alert-success alert-dismissible fade show ${this.state.showSuccess ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-circle-check me-2"></i>
                    {this.state.successMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showSuccess: false })}
                    >
                    </button>
                </div>

                {/* Add the alert for error messages */}
                <div 
                    className={`alert alert-danger alert-dismissible fade show ${this.state.showError ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    {this.state.errorMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showError: false })}
                    >
                    </button>
                </div>
            </>
        );
    };

    render() {
        const { fixNavbar } = this.props;
        const { title, due_date, priority, todoStatus, todos, loading, logged_in_employee_role, selectedEmployeeId, employees } = this.state;
        return (
            <>
                {this.renderAlertMessages()} {/* Show Toast Messages */}
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="table-responsive todo_list">
                                            <table className="table table-hover table-striped table-vcenter mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <button type="button" className="btn btn-info btn-sm" data-toggle="modal" data-target="#addTodoModal">Add New</button>
                                                        </th>
                                                        <th className="w150 text-right">Due</th>
                                                        <th className="w100">Priority</th>
                                                        <th className="w150">Status</th>
                                                        <th className="w80"><i className="icon-user" /></th>
                                                    </tr>
                                                </thead>
                                                {loading ? (
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="5">
                                                                <div className="d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
                                                                    <div className="loader" />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                ) : (
                                                    <tbody>
                                                        {todos && todos.length > 0 ? (
                                                            todos.map((todo, index) => (
                                                                <tr key={index+1}>
                                                                    <td>
                                                                        <label className="custom-control custom-checkbox">
                                                                            <input type="checkbox" className="custom-control-input" name="example-checkbox1" defaultValue="option1" /* defaultChecked */ />
                                                                            <span className="custom-control-label">{todo.title}</span>
                                                                        </label>
                                                                    </td>
                                                                    <td className="text-right">
                                                                        {new Date(todo.due_date).toLocaleString("en-US", {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric"
                                                                        }).replace(",", "")}
                                                                    </td>
                                                                    <td>
                                                                        <span className={`tag ml-0 mr-0 ${
                                                                            todo.priority === "high"
                                                                                ? "tag-danger"
                                                                                : todo.priority === "medium"
                                                                                ? "tag-warning"
                                                                                : "tag-success"
                                                                            }`}
                                                                        >
                                                                            {todo.priority.toUpperCase()}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`tag ml-0 mr-0 ${
                                                                            todo.todoStatus === "pending"
                                                                                ? "tag-warning"
                                                                                : todo.todoStatus === "in_progress"
                                                                                ? "tag-primary"
                                                                                : todo.todoStatus === "completed"
                                                                                ? "tag-success"
                                                                                : todo.todoStatus === "cancelled"
                                                                                ? "tag-danger"
                                                                                : "tag-secondary"
                                                                            }`}
                                                                        >
                                                                            {todo.todoStatus.replace(/_/g, " ").toUpperCase()}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className="avatar avatar-blue add-space"
                                                                            data-toggle="tooltip"
                                                                            data-placement="top"
                                                                            title={`${todo.first_name} ${todo.last_name}`}
                                                                        >
                                                                            {todo.first_name.charAt(0).toUpperCase()}{todo.last_name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ): (
                                                            <tr><td>Todo not available.</td></tr>
                                                        )}
                                                    </tbody>
                                                )}
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Department Modal */}
                <div className="modal fade" id="addTodoModal" tabIndex={-1} role="dialog" aria-labelledby="addTodoModalModalLabel" data-backdrop="static" 
                data-keyboard="false">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="addTodoModalLabel">Add Todo</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.resetFormErrors}><span aria-hidden="true">×</span></button>
                            </div>
                            <div className="modal-body">
                                <div className="row clearfix">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="title">Title</label>
                                            <input
                                                type="text"
                                                // className="form-control"
                                                className={`form-control ${this.state.errors.title ? "is-invalid" : ""}`}
                                                placeholder="Todo title"
                                                name="title"
                                                value={title}
                                                onChange={this.handleInputChangeForAddTodo}
                                            />
                                            {this.state.errors.title && (
                                                <small className="invalid-feedback">{this.state.errors.title}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="due_date">Due Date</label>
                                            <input
                                                type="date"
                                                className={`form-control ${this.state.errors.due_date ? "is-invalid" : ""}`}
                                                name="due_date"
                                                value={due_date}
                                                onChange={this.handleInputChangeForAddTodo}
                                            />
                                            {this.state.errors.due_date && (
                                                <small className="invalid-feedback">{this.state.errors.due_date}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="priority">Priority</label>
                                            <select
                                                className={`form-control ${this.state.errors.priority ? "is-invalid" : ""}`}
                                                value={priority}  // Bind value to state
                                                onChange={this.handleInputChangeForAddTodo}
                                                name="priority"
                                            >
                                                <option value="">Select Priority</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                            {this.state.errors.priority && (
                                                <small className="invalid-feedback">{this.state.errors.priority}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="todoStatus">Status</label>
                                            <select
                                                className={`form-control ${this.state.errors.todoStatus ? "is-invalid" : ""}`}
                                                value={todoStatus}
                                                onChange={this.handleInputChangeForAddTodo}
                                                name="todoStatus"
                                            >
                                                <option value="">Select Todo Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            {this.state.errors.todoStatus && (
                                                <small className="invalid-feedback">{this.state.errors.todoStatus}</small>
                                            )}
                                        </div>
                                    </div>

                                    {/* Show dropdown only if user is admin/super_admin */}
                                    {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                        <div className="col-md-12 col-sm-12">
                                            <label htmlFor="employeeSelect" className="form-label font-weight-bold">Select Employee</label>
                                            <select
                                                name="selectedEmployeeId"
                                                id="selectedEmployeeId"
                                                className={`form-control ${this.state.errors.selectedEmployeeId ? "is-invalid" : ""}`}
                                                value={selectedEmployeeId}
                                                onChange={this.handleInputChangeForAddTodo}
                                            >
                                                <option value="">Select an Employee</option>
                                                {employees.map((employee) => (
                                                    <option key={employee.id} value={employee.id}>
                                                        {employee.first_name} {employee.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {this.state.errors.selectedEmployeeId && (
                                                <small className="invalid-feedback">{this.state.errors.selectedEmployeeId}</small>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.resetFormErrors}>Close</button>
                                <button type="button" onClick={this.addTodoData} className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(TodoList);