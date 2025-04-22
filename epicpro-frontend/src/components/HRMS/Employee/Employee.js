import React, { Component } from 'react';
import CountUp from 'react-countup';
import { connect } from 'react-redux';
import {
	statisticsAction,
	statisticsCloseAction
} from '../../../actions/settingsAction';
class Employee extends Component {
	constructor(props) {
		super(props);
		this.handleStatistics = this.handleStatistics.bind(this);
		this.closeStatistics = this.closeStatistics.bind(this);
		this.sparkline1 = React.createRef();
		this.sparkline2 = React.createRef();
		this.sparkline3 = React.createRef();
		this.sparkline4 = React.createRef();
		this.state = {
			activeTab: 'Employee-list', // Default active tab
			showAddLeaveRequestModal: false,
			employeeData: [],
			employeeLeavesData: [],
			selectedSalaryDetails: [],
			totalLeaves: 0,
			approvedLeaves: 0,
			rejectedLeaves: 0,
			cancelledLeaves: 0,
			pendingLeaves: 0,
			message: null,
			deleteUser: null,
			// Initialize all fields with empty string or null
			fields: {
				first_name: '',
				last_name: '',
				email: '',
				gender: '',
				profile: '',
				dob: '',
				joining_date: '',
				mobile_no1: '',
				mobile_no2: '',
				address_line1: '',
				address_line2: '',
				emergency_contact1: '',
				emergency_contact2: '',
				emergency_contact3: '',
				frontend_skills: '',
				backend_skills: '',
				account_holder_name: '',
				account_number: '',
				ifsc_code: '',
				bank_name: '',
				bank_address: '',
				source: '',
				amount: '',
				from_date: '',
				to_date: '',
				aadhar_card_number: '',
				aadhar_card_file: '',
				pan_card_number: '',
				pan_card_file: '',
				driving_license_number: '',
				driving_license_file: '',
				facebook_url: '',
				twitter_url: '',
				linkedin_url: '',
				instagram_url: '',
				upwork_profile_url: '',
				resume: '',
			},
			// Set state for add employee leave
			employee_id: '',
			logged_in_employee_id: '',
			logged_in_employee_role: '',
			from_date: '',
			to_date: '',
			reason: '',
			status: '',
			selectedEmployeeLeave: '',
			deleteEmployeeLeave: '',
			searchQuery: "",
			currentPageEmployees: 1,
			currentPageLeaves: 1,
            dataPerPage: 10,
			loading: true,
			showSuccess: false,
			successMessage: '',
			showError: false,
			errorMessage: ''
		};
	}
	handleStatistics(e) {
		this.props.statisticsAction(e)
	}
	closeStatistics(e) {
		this.props.statisticsCloseAction(e)
	}

	calculateLeaveCounts = (employeeLeavesData) => {
		let totalLeaves = 0;
		let pendingLeaves = 0;
		let approvedLeaves = 0;
		let rejectedLeaves = 0;
		let cancelledLeaves = 0;
		// Iterate over the employee leaves data and calculate counts
		employeeLeavesData.forEach((leave) => {
			if (leave) {
				totalLeaves += 1;
				switch (leave.status) {
					case 'pending':
						pendingLeaves += 1;
						break;
					case 'approved':
						approvedLeaves += 1;
						break;
					case 'rejected':
						rejectedLeaves += 1;
						break;
					case 'cancelled':
						cancelledLeaves += 1;
						break;
					default:
						break;
				}
			}
		});
	
		return { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves };
	};

	componentDidMount() {
		if (window.user) {
			const { id, role } = window.user;
			this.setState({
				employee_id: id || null,
				logged_in_employee_role: role || null,
			});
	
			const apiUrl = process.env.REACT_APP_API_URL;
			let employeesUrl = "";
			let leavesUrl = "";
	
			// Role-based API selection
			if (role === "admin" || role === "super_admin") {
				employeesUrl = `${apiUrl}/get_employees.php?action=view&role=employee`; // Fetch all employees
				leavesUrl = `${apiUrl}/employee_leaves.php`; // Fetch all leaves
			} else if (role === "employee") {
				employeesUrl = `${apiUrl}/get_employees.php?action=view&user_id=${id}`; // Fetch only logged-in employee
				leavesUrl = `${apiUrl}/employee_leaves.php?employee_id=${id}`; // Fetch only logged-in employee's leaves
			} else {
				console.warn("Invalid role or role not found.");
				return;
			}
	
			// Fetch employees & leaves based on role
			Promise.all([
				fetch(employeesUrl, {
					method: "GET"
				}).then(res => res.json()),
				fetch(leavesUrl, {
					method: "GET"
				}).then(res => res.json()),
			])
			.then(([employeesData, employeeLeavesData]) => {
				// If only a single employee is returned, convert it to an array
				let employeesArray = Array.isArray(employeesData.data) ? employeesData.data : [employeesData.data];

				let employeesLeaveArray = Array.isArray(employeeLeavesData.data) ? employeeLeavesData.data : [employeeLeavesData.data];

				// Calculate leaves
				const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves } = 
					this.calculateLeaveCounts(employeeLeavesData.data);
	
				this.setState({
					employeeData: employeesArray,
					filterEmployeesData: employeesArray,
					employeeLeavesData: employeesLeaveArray,
					totalLeaves,
					pendingLeaves,
					approvedLeaves,
					rejectedLeaves,
					cancelledLeaves,
					loading: false
				});
			})
			.catch(err => {
				this.setState({ message: "Failed to fetch data", loading: false });
				console.error(err);
			});
		} else {
			console.warn("window.user is undefined");
		}
	}
		

	goToEditEmployee(employee, employeeId) {
		// Fetch salary details based on employee_id
		fetch(`${process.env.REACT_APP_API_URL}/employee_salary_details.php?action=view&employee_id=${employeeId}`,{
			method: "POST",
		})
        .then((res) => res.json())
        .then((salaryDetails) => {
            if (salaryDetails.data) {
				this.props.history.push({
                    pathname: `/edit-employee`,
                    state: { employee, selectedSalaryDetails: salaryDetails.data, employeeId }
                });
            } else {
				console.warn("No salary details found for this employee. Navigating without salary details.");
                this.props.history.push({
					pathname: `/edit-employee`,
					state: { employee, selectedSalaryDetails: [], employeeId } // Pass an empty array or default data
				});
            }
        })
        .catch((err) => {
            console.error("Failed to fetch salary details", err);
        });
	}

	viewEmployee(employee, employeeId) {
		this.props.history.push({
			pathname: `/view-employee`,
			state: { 
				employee, 
				employeeId,
			}
		});
	}

	// Function to handle tab change
    handleTabChange = (tabId) => {
        this.setState({ activeTab: tabId });
    };

	// Function for "Add" button based on active tab
    goToAddEmployee = () => {
        const { activeTab } = this.state;
        switch (activeTab) {
            case 'Employee-list':
                // Handle Add for Employee List
                this.props.history.push("/add-employee");
                break;
            case 'Employee-Request':
                this.setState({ showAddLeaveRequestModal: true }); // Show the modal
                break;
            default:
                break;
        }
    };

	// Delete Employee
	openDeleteModal = (userId) => {
        this.setState({
            deleteUser: userId,
        });
    };

	confirmDelete = () => {
		const { deleteUser, currentPageEmployees, employeeData, dataPerPage } = this.state;
		const {id, role} = window.user;
		const loggedInUserId = id; // Get logged-in user ID
		const loggedInUserRole = role; // Get logged-in user role
	
		if (!deleteUser) return;
	
		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=delete`, {
			method: "POST",  // Change method from DELETE to POST
			headers: {
				"Content-Type": "application/json",
				method: "POST",
			},
			body: JSON.stringify({
				user_id: deleteUser,
				logged_in_employee_id: loggedInUserId,
				logged_in_employee_role: loggedInUserRole,
			}),
		})
		.then((response) => response.json())
		.then((data) => {
			if (data.status === "success") {
				// Update users state after deletion
				const updatedEmployees = employeeData.filter((d) => d.id !== deleteUser);

				// Calculate the total pages after deletion
				const totalPages = Math.ceil(updatedEmployees.length / dataPerPage);
	
				// Adjust currentPageEmployees if necessary (if we're on a page that no longer has data)
				let newPage = currentPageEmployees;
				if (updatedEmployees.length === 0) {
					newPage = 1;
				} else if (currentPageEmployees > totalPages) {
					newPage = totalPages;
				}

				this.setState({
					employeeData: updatedEmployees,
					successMessage: "Employee deleted successfully",
					showSuccess: true,
					currentPageEmployees: newPage, // Update currentPageEmployees to the new page
					deleteUser: null,  // Clear the deleteUser state
				});
				document.querySelector("#deleteEmployeeModal .close").click();
			} else {
				alert("Failed to delete employee.");
			}
		})
		.catch((error) => console.error("Error:", error));
	};
	

	// Function to close the modal
    closeModal = () => {
        this.setState({ showAddLeaveRequestModal: false });
    };

	// Handle input changes for employee leave
    handleInputChangeForAddLeaves = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

	handleLeaveStatus = (event) => {
		const { value } = event.target;
		this.setState({
            status: value, // Update selectedRole in state
        });
    };

	handleInputChangeForEditEmployeeLeave = (event) => {
		const { name, value } = event.target;
		this.setState((prevState) => ({
            selectedEmployeeLeave: {
                ...prevState.selectedEmployeeLeave,
                [name]: value, // Dynamically update the field
            },
        }));
	}

	// API endpoint to add employee leave data
    addLeave = (event) => {
		event.preventDefault();

        const { employee_id, from_date, to_date, reason, status, logged_in_employee_role} = this.state;

        // Validate form inputs
        if (!from_date || !to_date || !reason) {
            console.log("Please fill in all fields");
            return;
        }

		// If role is 'employee', force status to 'pending'
		// const finalStatus = logged_in_employee_role === "employee" ? "pending" : status;
		const finalStatus = status || "pending"; 

		// Ensure correct employee_id is sent
		const selectedEmployeeId = logged_in_employee_role === "employee" ? window.user.id : employee_id;

        const addEmployeeLeaveData = new FormData();
        addEmployeeLeaveData.append('employee_id', selectedEmployeeId);
        addEmployeeLeaveData.append('from_date', from_date);
        addEmployeeLeaveData.append('to_date', to_date);
        addEmployeeLeaveData.append('reason', reason);
        addEmployeeLeaveData.append('status', finalStatus);

        // API call to add employee leave
        fetch(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=add`, {
            method: "POST",
            body: addEmployeeLeaveData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
				this.setState((prevState) => {
					const updatedEmployeeLeavesData = [...(prevState.employeeLeavesData || []), data.data];
					
					// Calculate the leave counts
					const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);
					
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						totalLeaves,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves,
						cancelledLeaves,
						// Clear form fields after submission
						from_date: "",
						to_date: "",
						reason: "",
						status: "",
						showSuccess: true,
						successMessage: data.message
					};
				});
				document.querySelector("#addLeaveRequestModal .close").click();
				setTimeout(() => this.setState({ showSuccess: false }), 3000);
            } else {
				this.setState({
					showError: true,
					errorMessage: data.message,
				});
				setTimeout(() => this.setState({ showError: false }), 3000);
            }
        })
        .catch((error) => {
			console.error("Error:", error);
			this.setState({
				showError: true,
				errorMessage: "An error occurred. Please try again later.",
			});
			setTimeout(() => this.setState({ showError: false }), 3000);
		});
    };

	
	// Handle employee leave edit button
    handleEditClickForEmployeeLeave = (employeeLeave) => {
		this.setState({ selectedEmployeeLeave: employeeLeave });
    };
	
	// API endpoint to update/edit employee leave data
	updateEmployeeLeave = () => {
		const { selectedEmployeeLeave } = this.state;
		if (!selectedEmployeeLeave) return;

		const updateEmployeeLeaveData = new FormData();
		updateEmployeeLeaveData.append('employee_id', selectedEmployeeLeave.employee_id);
		updateEmployeeLeaveData.append('from_date', selectedEmployeeLeave.from_date);
		updateEmployeeLeaveData.append('to_date', selectedEmployeeLeave.to_date);
		updateEmployeeLeaveData.append('reason', selectedEmployeeLeave.reason);
        updateEmployeeLeaveData.append('status', selectedEmployeeLeave.status);

		// Example API call
		fetch(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=edit&id=${selectedEmployeeLeave.id}`, {
			method: 'POST',
			body: updateEmployeeLeaveData,
		})
		.then((response) => response.json())
		.then((data) => {
			if (data.status === "success") {
				this.setState((prevState) => {
					// Update the employee leave data with the new data
					const updatedEmployeeLeavesData = prevState.employeeLeavesData.map((leave) => {
						if (leave.id === selectedEmployeeLeave.id) {
							return { ...leave, ...selectedEmployeeLeave }; // Replace the old leave with the updated one
						}
						return leave;
					});
	
					// Calculate the leave counts, excluding the totalLeaves count
					const { pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);
					
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves,
						cancelledLeaves,
						showSuccess: true,
						successMessage: data.message
					};
				});

				document.querySelector("#editLeaveRequestModal .close").click();
				setTimeout(() => this.setState({ showSuccess: false }), 3000);
			} else {
				this.setState({
					showError: true,
					errorMessage: data.message,
				});
				setTimeout(() => this.setState({ showError: false }), 3000);
			}
		})
		.catch((error) => {
			console.error("Error:", error);
			this.setState({
				showError: true,
				errorMessage: "An error occurred. Please try again later.",
			});
			setTimeout(() => this.setState({ showError: false }), 3000);
		});
	};

	// Delete Employee leave
	openDeleteLeaveModal = (leaveId) => {
        this.setState({
            deleteEmployeeLeave: leaveId,
        });
    };

	confirmDeleteForEmployeeLeave = () => {
        const { deleteEmployeeLeave, currentPageLeaves, dataPerPage } = this.state;
      
        if (!deleteEmployeeLeave) {
			console.error("Employee leave ID is not found for deletion.");
			return;
		}

        fetch(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=delete&id=${deleteEmployeeLeave}`, {
          	method: 'DELETE',
        })
        .then((response) => response.json())
        .then((data) => {
			if (data.status === "success") {
				this.setState((prevState) => {
					// Remove the leave data with the specified ID
					const updatedEmployeeLeavesData = prevState.employeeLeavesData.filter((d) => d.id !== deleteEmployeeLeave);
			
					// Calculate the leave counts
					const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);

					// Calculate the total pages after deletion
					const totalPages = Math.ceil(updatedEmployeeLeavesData.length / dataPerPage);
		
					// Adjust currentPage if necessary (if we're on a page that no longer has data)
					let newPage = currentPageLeaves;
					if (updatedEmployeeLeavesData.length === 0) {
						newPage = 1;
					} else if (currentPageLeaves > totalPages) {
						newPage = totalPages;
					}
			
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						totalLeaves,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves,
						cancelledLeaves,
						currentPageLeaves: newPage,
						showSuccess: true,
						successMessage: data.message
					};
				});
				// Close the modal after deletion
				document.querySelector("#deleteLeaveRequestModal .close").click();
				setTimeout(() => this.setState({ showSuccess: false }), 3000);
			} else {
				this.setState({
					showError: true,
					errorMessage: data.message,
				});
				setTimeout(() => this.setState({ showError: false }), 3000);
			}
        })
		.catch((error) => {
			console.error("Error:", error);
			this.setState({
				showError: true,
				errorMessage: "An error occurred. Please try again later.",
			});
			setTimeout(() => this.setState({ showError: false }), 3000);
		});
    };

	// Handle Pagination of employee listing and employee leaves listing
	handlePageChange = (newPage, listType) => {
		if (listType === 'employees') {
			const totalPages = Math.ceil(this.state.employeeData.length / this.state.dataPerPage);
			if (newPage >= 1 && newPage <= totalPages) {
				this.setState({ currentPageEmployees: newPage });
			}
		} else if (listType === 'leaves') {
			const totalPages = Math.ceil(this.state.employeeLeavesData.length / this.state.dataPerPage);
			if (newPage >= 1 && newPage <= totalPages) {
				this.setState({ currentPageLeaves: newPage });
			}
		}
	};	

	// Add searching user by name and email
	handleSearch = (event) => {
        const query = event.target.value.toLowerCase(); // Get search input
        this.setState({ searchQuery: query }, () => {
			if (query === "") {
				// If search is empty, reset users to the original list
				this.setState({ employeeData: this.state.filterEmployeesData, currentPageEmployees: 1 });
			} else {
				const filtered = this.state.filterEmployeesData.filter(employee => {
					return (
						employee.first_name.toLowerCase().includes(query) ||
						employee.last_name.toLowerCase().includes(query) ||
						`${employee.first_name.toLowerCase()} ${employee.last_name.toLowerCase()}`.includes(query) ||  
						employee.email.toLowerCase().includes(query)
					);
				});
				this.setState({ employeeData: filtered, currentPageEmployees: 1});
			}
        });
    };

	// Render function for success and error messages
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
		const { fixNavbar, /* statisticsOpen, statisticsClose */ } = this.props;
		const { activeTab, showAddLeaveRequestModal, employeeData, employeeLeavesData, totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, cancelledLeaves, message, selectedEmployeeLeave, currentPageEmployees,  currentPageLeaves, dataPerPage, loading } = this.state;

		// Handle empty employee data safely
		const employeeList = (employeeData || []).length > 0 ? employeeData : [];
		const leaveList = (employeeLeavesData || []).length > 0 ? employeeLeavesData : [];

		// Pagination Logic for Employees
		const indexOfLastEmployee = this.state.currentPageEmployees * dataPerPage;
		const indexOfFirstEmployee = indexOfLastEmployee - dataPerPage;
		const currentEmployees = employeeList.slice(indexOfFirstEmployee, indexOfLastEmployee);
		const totalPagesEmployees = Math.ceil(employeeList.length / dataPerPage);

		// Pagination logic for employee leaves
		const indexOfLastLeave = this.state.currentPageLeaves * dataPerPage;
		const indexOfFirstLeave = indexOfLastLeave - dataPerPage;
		const currentEmployeeLeaves = leaveList.slice(indexOfFirstLeave, indexOfLastLeave);
		const totalPagesLeaves = Math.ceil(leaveList.length / dataPerPage);

		return (
			<>
				{this.renderAlertMessages()} {/* Show Messages */}
				<div>
					<div>
						<div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
							<div className="container-fluid">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<ul className="nav nav-tabs page-header-tab">
										<li className="nav-item">
											<a
												className={`nav-link ${activeTab === 'Employee-list' ? 'active' : ''}`}
												id="Employee-tab"
												data-toggle="tab"
												href="#Employee-list"
												onClick={() => this.handleTabChange('Employee-list')}
											>
												All
											</a>
										</li>
										<li className="nav-item">
											<a
												className={`nav-link ${activeTab === 'Employee-Request' ? 'active' : ''}`}
												id="Employee-tab"
												data-toggle="tab"
												href="#Employee-Request"
												onClick={() => this.handleTabChange('Employee-Request')}
											>
												Leave Request
											</a>
										</li>
									</ul>
									{/* Render the Add buttons and icons */}
									<div className="header-action">
											<button
												onClick={() => this.goToAddEmployee()}
												type="button"
												className="btn btn-primary"
											>
												<i className="fe fe-plus mr-2" />
												{activeTab === 'Employee-list' && 'Add Employee'}
												{activeTab === 'Employee-Request' && 'Add Leave'}
											</button>
									</div>
								</div>
								{/* Show leave count */}
								<div className="row">
									{[
										{ label: "Total Leaves", value: totalLeaves },
										{ label: "Approved Leaves", value: approvedLeaves },
										{ label: "Rejected Leaves", value: rejectedLeaves },
										{ label: "Pending Leaves", value: pendingLeaves },
										{ label: "Cancelled Leaves", value: cancelledLeaves}
									].map((item, index) => (
										<div className="col-lg-2 custom-col col-md-6" key={index}>
											<div className="card">
												<div className="card-body w_sparkline">
													<div className="details">
														<span>{item.label}</span>
														{loading ? (
															<div className="d-flex" style={{ height: "20px" }}>
																<div className="spinner-border" role="status" style={{ width: "20px", height: "20px", borderWidth: "2px" }}>
																<span className="sr-only">Loading...</span>
																</div>
															</div>
														) : (
															<h3 className="mb-0 counter">
																<CountUp end={item.value} />
															</h3>
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="section-body">
							<div className="container-fluid">
								<div className="tab-content">
									<div className="tab-pane fade show active" id="Employee-list" role="tabpanel">
										<div className="card">
											<div className="card-header">
												<h3 className="card-title">Employee List</h3>
												<div className="card-options">
													<div className="input-group">
														<div className="input-icon ml-2">
															<span className="input-icon-addon">
																<i className="fe fe-search" />
															</span>
															<input
																type="text"
																className="form-control"
																placeholder="Search employee..."
																// name="s"
																value={this.state.searchQuery}
																onChange={this.handleSearch}
															/>
														</div>
													</div>
												</div>
											</div>
											<div className="card-body">
												{loading ? (
													<div className="card-body">
														<div className="dimmer active">
															<div className="loader" />
														</div>
													</div>
                                                ) : ( // Show Table after loading is false
													<div className="table-responsive">
														<table className="table table-hover table-striped table-vcenter text-nowrap mb-0">
															<thead>
																<tr>
																	<th>#</th>
																	<th>Name</th>
																	<th>Employee ID</th>
																	<th>Phone</th>
																	<th>Join Date</th>
																	<th>Role</th>
																	<th>Action</th>
																</tr>
															</thead>
															<tbody>
																{currentEmployees.length > 0 ? (
																	currentEmployees.map((employee, index) => (
																		<tr key={index}>
																			<td className="w40">
																				{((this.state.currentPageEmployees - 1) * dataPerPage + index + 1)
																				.toString()
																				.padStart(2, '0')}
																			</td>
																			<td className="d-flex">
																				<span
																					className="avatar avatar-blue"
																					data-toggle="tooltip"
																					data-original-title="Avatar Name"
																				>
																					{employee.first_name.charAt(0).toUpperCase()}{employee.last_name.charAt(0).toUpperCase()}
																				</span>
																				<div className="ml-3">
																					<h6 className="mb-0">
																						{`${employee.first_name} ${employee.last_name}`}
																					</h6>
																					<span className="text-muted">
																						{employee.email}
																					</span>
																				</div>
																			</td>
																			<td>
																				<span>{employee.code}</span>
																			</td>
																			<td>
																				<span>{employee.mobile_no1}</span>
																			</td>
																			<td>
																				{new Intl.DateTimeFormat('en-US', {
																					day: '2-digit',
																					month: 'short',
																					year: 'numeric',
																				}).format(new Date(employee.joining_date))}
																			</td>
																			<td>{employee.department_name}</td>
																			<td>
																				<button 
																					type="button"
																					className="btn btn-icon btn-sm"
																					title="View"
																					onClick={() => this.viewEmployee(employee, employee.id)}
																				>
																					<i className="fa fa-eye" />
																				</button>
																				<button
																					onClick={() => this.goToEditEmployee(employee, employee.id)}
																					type="button"
																					className="btn btn-icon btn-sm"
																					title="Edit"
																				>
																					<i className="fa fa-edit" />
																				</button>
																				<button 
																					type="button"
																					className="btn btn-icon btn-sm js-sweetalert"
																					title="Delete"
																					data-type="confirm"
																					data-toggle="modal"
																					data-target="#deleteEmployeeModal"
																					onClick={() => this.openDeleteModal(employee.id)}
																				>
																					<i className="fa fa-trash-o text-danger" />
																				</button>
																			</td>
																		</tr>
																	))
																): (
																	!message && <tr><td>No employees found</td></tr>
																)}
															</tbody>
														</table>
													</div>
												)}
											</div>
										</div>

										{/* Only show pagination if there are employees */}
										{totalPagesEmployees > 1 && (
											<nav aria-label="Page navigation">
												<ul className="pagination mb-0 justify-content-end">
													<li className={`page-item ${currentPageEmployees === 1 ? 'disabled' : ''}`}>
														<button className="page-link" onClick={() => this.handlePageChange(currentPageEmployees - 1, 'employees')}>
															Previous
														</button>
													</li>
													{[...Array(totalPagesEmployees)].map((_, i) => (
														<li key={i} className={`page-item ${currentPageEmployees === i + 1 ? 'active' : ''}`}>
															<button className="page-link" onClick={() => this.handlePageChange(i + 1, 'employees')}>
																{i + 1}
															</button>
														</li>
													))}
													<li className={`page-item ${currentPageEmployees === totalPagesEmployees ? 'disabled' : ''}`}>
														<button className="page-link" onClick={() => this.handlePageChange(currentPageEmployees + 1, 'employees')}>
															Next
														</button>
													</li>
												</ul>
											</nav>
										)}
									</div>
									<div className="tab-pane fade" id="Employee-Request" role="tabpanel">
										<div className="card">
											<div className="card-header">
												<h3 className="card-title">Leave List</h3>
											</div>
											<div className="card-body">
												{loading ? (
													<div className="card-body">
														<div className="dimmer active">
															<div className="loader" />
														</div>
													</div>
                                                ) : ( // Show Table after loading is false
													<div className="table-responsive">
														<table className="table table-hover table-striped table-vcenter text-nowrap mb-0">
															<thead>
																<tr>
																	<th>#</th>
																	<th>Name</th>
																	<th>Date</th>
																	<th>Reason</th>
																	<th>Status</th>
																	<th>Action</th>
																</tr>
															</thead>
															<tbody>
																{currentEmployeeLeaves.length > 0 ? (
																	currentEmployeeLeaves.map((leave, index) => (
																		<tr key={index}>
																			<td className="width45">
																				<span
																					className="avatar avatar-orange"
																					data-toggle="tooltip"
																					title="Avatar Name"
																				>
																					{leave.first_name.charAt(0).toUpperCase()}{leave.last_name.charAt(0).toUpperCase()}
																				</span>
																			</td>
																			<td>
																				<div className="font-15">
																					{`${leave.first_name} ${leave.last_name}`}
																				</div>
																			</td>
																			<td>
																			{`${new Intl.DateTimeFormat('en-US', {
																				day: '2-digit',
																				month: 'short',
																				year: 'numeric',
																				}).format(new Date(leave.from_date))} to ${new Intl.DateTimeFormat('en-US', {
																				day: '2-digit',
																				month: 'short',
																				year: 'numeric',
																				}).format(new Date(leave.to_date))}`}
																			</td>
																			<td>{leave.reason}</td>
																			<td>
																				<span className={
																					`tag ${
																					leave.status === 'approved'
																					? 'tag-success'
																					: leave.status === 'pending'
																					? 'tag-warning'
																					: 'tag-danger'
																					}`}>
																						{leave.status}
																				</span>
																			</td>
																			<td>
																				<button 
																					type="button"
																					className="btn btn-icon btn-sm"
																					title="Edit"
																					data-toggle="modal"
																					data-target="#editLeaveRequestModal"
																					onClick={() => this.handleEditClickForEmployeeLeave(leave)}
																				>
																					<i className="fa fa-edit" />
																				</button>
																				<button
																					type="button"
																					className="btn btn-icon btn-sm js-sweetalert"
																					title="Delete"
																					data-type="confirm"
																					data-toggle="modal"
																					data-target="#deleteLeaveRequestModal"
																					onClick={() => this.openDeleteLeaveModal(leave.id)}
																				>
																					<i className="fa fa-trash-o text-danger" />
																				</button>
																			</td>
																		</tr>
																	))
																): (
																	!message && <tr><td>No leaves found</td></tr>
																)}
															</tbody>
														</table>
													</div>
												)}
											</div>
										</div>

										{/* Only show pagination if there are employee leaves */}
										{totalPagesLeaves > 1 && (
											<nav aria-label="Page navigation">
												<ul className="pagination mb-0 justify-content-end">
													<li className={`page-item ${currentPageLeaves === 1 ? 'disabled' : ''}`}>
														<button className="page-link" onClick={() => this.handlePageChange(currentPageLeaves - 1, 'leaves')}>
															Previous
														</button>
													</li>
													{[...Array(totalPagesLeaves)].map((_, i) => (
														<li key={i} className={`page-item ${currentPageLeaves === i + 1 ? 'active' : ''}`}>
															<button className="page-link" onClick={() => this.handlePageChange(i + 1, 'leaves')}>
																{i + 1}
															</button>
														</li>
													))}
													<li className={`page-item ${currentPageLeaves === totalPagesLeaves ? 'disabled' : ''}`}>
														<button className="page-link" onClick={() => this.handlePageChange(currentPageLeaves + 1, 'leaves')}>
															Next
														</button>
													</li>
												</ul>
											</nav>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Modal for Add Leave Request */}
				{showAddLeaveRequestModal && (
				<div className="modal fade show d-block" id="addLeaveRequestModal" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Add Leave Request</h5>
								<button type="button" className="close" onClick={this.closeModal}>
									<span>&times;</span>
								</button>
							</div>
							<div className="modal-body">
								<div className="row clearfix">
									<input
										type="hidden"
										className="form-control"
										placeholder="employeeId"
										name='employeeId'
										value={this.state.employee_id}
										onChange={this.handleInputChangeForAddLeaves}
									/>
									{(this.state.logged_in_employee_role === "admin" || this.state.logged_in_employee_role === "super_admin") && (
										<div className="col-md-12">
											<div className="form-group">
												<label className="form-label">Select Employee</label>
												<select 
													name="employee_id"
													className="form-control"
													onChange={this.handleInputChangeForAddLeaves}
													value={this.state.employee_id}
												>
													<option value="">Select Employee</option>
													{this.state.employeeData.map((emp) => (
														<option key={emp.id} value={emp.id}>
															{emp.first_name} {emp.last_name}
														</option>
													))}
												</select>
											</div>
										</div>
									)}

									<div className="col-md-6">
										<div className="form-group">
											<label className="form-label">From Date</label>
											<input
												type="date"
												className="form-control"
												name='from_date'
												value={this.state.from_date}
												onChange={this.handleInputChangeForAddLeaves}
											/>
										</div>
									</div>
									<div className="col-md-6">
										<div className="form-group">
											<label className="form-label">To Date</label>
											<input
												type="date"
												className="form-control"
												name='to_date'
												value={this.state.to_date}
												onChange={this.handleInputChangeForAddLeaves}
											/>
										</div>
									</div>
									<div className="col-md-12">
										<div className="form-group">
											<label className="form-label">Reason</label>
											<input
												type="text"
												className="form-control"
												name='reason'
												placeholder="Reason"
												value={this.state.reason}
												onChange={this.handleInputChangeForAddLeaves}
											/>
										</div>
									</div>
									{(this.state.logged_in_employee_role === "admin" || this.state.logged_in_employee_role === "super_admin") && (
										<div className="col-sm-6 col-md-6">
											<div className="form-group">
												<label className="form-label">Status</label>
												<select 
													name="status"
													className="form-control"
													id="status"
													onChange={this.handleLeaveStatus}
													value={this.state.status}
												>
													<option value="pending">Pending</option>
													<option value="cancelled">Cancelled</option> 
													<option value="approved">Approved</option>
													<option value="rejected">Rejected</option>
												</select>
											</div>
										</div>
									)}
								</div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={this.closeModal}>
									Close
								</button>
								<button
									type="button"
									className="btn btn-primary"
									onClick={this.addLeave}
								>
									Add Leave
								</button>
							</div>
						</div>
					</div>
				</div>
				)}

				{/* Edit Leave Request Modal */}
				<div className="modal fade" id="editLeaveRequestModal" tabIndex={-1} role="dialog" aria-labelledby="editLeaveRequestModalLabel">
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title" id="editLeaveRequestModalLabel">Edit Leave Request</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
							</div>
							<form>
								<div className="modal-body">
									{selectedEmployeeLeave ? (
										<div className="row clearfix">
											<input
												type="hidden"
												className="form-control"
												value={selectedEmployeeLeave?.employee_id || ""} 
												onChange={this.handleInputChangeForEditEmployeeLeave}
												name="employee_id"
											/>
											<div className="col-md-6">
												<div className="form-group">
													<label className="form-label">From Date</label>
													<input
														type="date"
														className="form-control"
														value={selectedEmployeeLeave?.from_date || ""} 
														onChange={this.handleInputChangeForEditEmployeeLeave}
														name="from_date"
													/>
												</div>
											</div>
											<div className="col-md-6">
												<div className="form-group">
													<label className="form-label">To Date</label>
													<input
														type="date"
														className="form-control"
														value={selectedEmployeeLeave?.to_date || ""} 
														onChange={this.handleInputChangeForEditEmployeeLeave}
														name="to_date"
													/>
												</div>
											</div>
											<div className="col-md-12">
												<div className="form-group">
													<label className="form-label">Reason</label>
													<input
														type="text"
														className="form-control"
														value={selectedEmployeeLeave?.reason || ""} 
														onChange={this.handleInputChangeForEditEmployeeLeave}
														name="reason"
													/>
												</div>
											</div>
											<div className="col-sm-6 col-md-6">
												<div className="form-group">
													<label className="form-label">Status</label>
													<select 
														name="status"
														className="form-control"
														id='status'
														value={selectedEmployeeLeave?.status || ""}
														onChange={this.handleInputChangeForEditEmployeeLeave}
													>
														{/* Instead of "Select Status", show the assigned status */}
														<option value={selectedEmployeeLeave?.status}>
															{selectedEmployeeLeave?.status.charAt(0).toUpperCase() + selectedEmployeeLeave?.status.slice(1)}
														</option>
														{this.state.logged_in_employee_role === "admin" || this.state.logged_in_employee_role === "super_admin" ? (
															<>
																{selectedEmployeeLeave?.status !== "approved" && <option value="approved">Approved</option>}
																{selectedEmployeeLeave?.status !== "pending" && <option value="pending">Pending</option>}
																{selectedEmployeeLeave?.status !== "rejected" && <option value="rejected">Rejected</option>}
															</>
														) : (
															<>
																{this.state.logged_in_employee_role === "employee" && selectedEmployeeLeave?.status === "pending" && (
																	<option value="cancelled">Cancelled</option>
																)}
															</>
														)}
													</select>
												</div>
											</div>
										</div>
									) : (
										<p>Loading employee leave data...</p>
									)}
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
									<button type="button" onClick={this.updateEmployeeLeave} className="btn btn-primary">Save</button>
								</div>
							</form>
						</div>
					</div>
				</div>

				{/* Delete Leave Request Modal */}
				<div className="modal fade" id="deleteLeaveRequestModal" tabIndex={-1} role="dialog" aria-labelledby="deleteLeaveRequestLabel">
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header" style={{ display: 'none' }}>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
							</div>
							<div className="modal-body">
								<div className="row clearfix">
									<p>Are you sure you want to delete the leave?</p>
								</div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
								<button type="button" onClick={this.confirmDeleteForEmployeeLeave}  className="btn btn-danger">Delete</button>
							</div>
						</div>
					</div>
				</div>

				{/* Delete Employee Model */}
				<div className="modal fade" id="deleteEmployeeModal" tabIndex={-1} role="dialog" aria-labelledby="deleteEmployeeModalLabel">
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header" style={{ display: 'none' }}>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
							</div>
							<div className="modal-body">
								<div className="row clearfix">
									<p>Are you sure you want to delete the employee?</p>
								</div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
								<button type="button" onClick={this.confirmDelete}  className="btn btn-danger">Delete</button>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar,
	statisticsOpen: state.settings.isStatistics,
	statisticsClose: state.settings.isStatisticsClose,
})

const mapDispatchToProps = dispatch => ({
	statisticsAction: (e) => dispatch(statisticsAction(e)),
	statisticsCloseAction: (e) => dispatch(statisticsCloseAction(e))
})
export default connect(mapStateToProps, mapDispatchToProps)(Employee);