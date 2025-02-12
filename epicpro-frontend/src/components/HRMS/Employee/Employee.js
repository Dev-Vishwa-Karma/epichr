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
			pendingLeaves: 0,
			approvedLeaves: 0,
			rejectedLeaves: 0,
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
			from_date: '',
			to_date: '',
			reason: '',
			status: '',
			selectedEmployeeLeave: '',
			deleteEmployeeLeave: '',
		};
	}
	handleStatistics(e) {
		this.props.statisticsAction(e)
	}
	closeStatistics(e) {
		this.props.statisticsCloseAction(e)
	}

	calculateLeaveCounts = (employeeLeavesData) => {
		console.log('employeeLeavesData = ', employeeLeavesData);
		let totalLeaves = 0;
		let pendingLeaves = 0;
		let approvedLeaves = 0;
		let rejectedLeaves = 0;
	
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
				default:
					break;
			}
			}
		});
	
		return { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves };
	};	

	componentDidMount() {
		const apiUrl = process.env.REACT_APP_API_URL;

		// Make the GET API call when the component is mounted
		Promise.all([
            fetch(`${apiUrl}/get_employees.php?action=view&role=employee`).then((res) => res.json()),
            fetch(`${apiUrl}/employee_leaves.php`).then((res) => res.json()),
        ])
		.then(([employeesData, employeeLeavesData]) => {
			// Calculate leaves
			const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves } = this.calculateLeaveCounts(employeeLeavesData.data);

			this.setState({
				employeeData: employeesData.data,
				employeeLeavesData: employeeLeavesData.data,
				totalLeaves: totalLeaves,
				pendingLeaves: pendingLeaves,
				approvedLeaves: approvedLeaves,
				rejectedLeaves: rejectedLeaves
			});

		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data' });
			console.error(err);
		});
	}

	goToEditEmployee(employee, employeeId) {
		console.log(employee)
		// Fetch salary details based on employee_id
		fetch(`${process.env.REACT_APP_API_URL}/employee_salary_details.php?action=view&employee_id=${employeeId}`)
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

	viewEmployee() {
		this.props.history.push("/view-employee");
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
        const { deleteUser } = this.state;
      
        if (!deleteUser) return;
      
        // fetch(`http://localhost/react/epicpro-backend/users.php?action=delete&user_id=${deleteUser}`, {
		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=delete&user_id=${deleteUser}`, {
          	method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => {
			if (data.status === "success") {
				this.setState((prevState) => ({
					employeeData: prevState.employeeData.filter((d) => d.id !== deleteUser),
				}));
				document.querySelector("#deleteEmployeeModal .close").click();
			} else {
				alert('Failed to delete department.');
			}
        })
        .catch((error) => console.error('Error:', error));
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
		const { name, value } = event.target;
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
    addLeave = () => {
        const { employee_id, from_date, to_date, reason, status} = this.state;

        // Validate form inputs
        if (!from_date || !to_date || !reason) {
            alert("Please fill in all fields");
            return;
        }

        const addEmployeeLeaveData = new FormData();
        addEmployeeLeaveData.append('employee_id', employee_id);
        addEmployeeLeaveData.append('from_date', from_date);
        addEmployeeLeaveData.append('to_date', to_date);
        addEmployeeLeaveData.append('reason', reason);
        addEmployeeLeaveData.append('status', status);

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
					const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);
					
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						totalLeaves,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves,
						
						// Clear form fields after submission
						from_date: "",
						to_date: "",
						reason: "",
						status: ""
					};
				});
				document.querySelector("#addLeaveRequestModal .close").click();
            } else {
                console.log("Failed to employee leave");
            }
        })
        .catch((error) => console.error("Error:", error));
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
			if (data.status == "success") {
				this.setState((prevState) => {
					// Update the employee leave data with the new data
					const updatedEmployeeLeavesData = prevState.employeeLeavesData.map((leave) => {
						if (leave.id === selectedEmployeeLeave.id) {
							return { ...leave, ...selectedEmployeeLeave }; // Replace the old leave with the updated one
						}
						return leave;
					});
	
					// Calculate the leave counts, excluding the totalLeaves count
					const { pendingLeaves, approvedLeaves, rejectedLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);
					
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves,
					};
				});

				document.querySelector("#editLeaveRequestModal .close").click();
				// Optionally reload the department data here
			} else {
				console.log('Failed to update employee leave!');
			}
		})
		.catch((error) => console.error('Error updating user:', error));
	};

	// Delete Employee leave
	openDeleteLeaveModal = (leaveId) => {
        this.setState({
            deleteEmployeeLeave: leaveId,
        });
    };

	confirmDeleteForEmployeeLeave = () => {
        const { deleteEmployeeLeave } = this.state;
      
        if (!deleteEmployeeLeave) return;
      
        // fetch(`http://localhost/react/epicpro-backend/users.php?action=delete&user_id=${deleteUser}`, {
		fetch(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=delete&id=${deleteEmployeeLeave}`, {
          	method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => {
			if (data.status === "success") {
				this.setState((prevState) => {
					// Remove the leave data with the specified ID
					const updatedEmployeeLeavesData = prevState.employeeLeavesData.filter((d) => d.id !== deleteEmployeeLeave);
			
					// Calculate the leave counts
					const { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves } = this.calculateLeaveCounts(updatedEmployeeLeavesData);
			
					// Return the updated state
					return {
						employeeLeavesData: updatedEmployeeLeavesData,
						totalLeaves,
						pendingLeaves,
						approvedLeaves,
						rejectedLeaves
					};
				});
				// Close the modal after deletion
				document.querySelector("#deleteLeaveRequestModal .close").click();
			} else {
				console.log('Failed to delete employee leave.');
			}
        })
        .catch((error) => console.error('Error:', error));
    };


	render() {
		const { fixNavbar, /* statisticsOpen, statisticsClose */ } = this.props;
		const { activeTab, showAddLeaveRequestModal, employeeData, employeeLeavesData, totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves, message, selectedEmployeeLeave } = this.state;
		return (
			<>
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
								<div className="row">
									<div className="col-lg-3 col-md-6">
										<div className="card">
											<div className="card-body w_sparkline">
												<div className="details">
													<span>Total Leaves</span>
													<h3 className="mb-0">
														<span className="counter">	<CountUp end={totalLeaves} /></span>
													</h3>
												</div>
												<div className="w_chart">
													<div id="mini-bar-chart1" className="mini-bar-chart" />
												</div>
											</div>
										</div>
										{/* 
											<div className="w_chart">
													<span
														ref={this.sparkline1}
														id="mini-bar-chart1"
														className="mini-bar-chart"
													></span>
												</div>
										*/}
									</div>
									<div className="col-lg-3 col-md-6">
										<div className="card">
											<div className="card-body w_sparkline">
												<div className="details">
													<span>Approved Leaves</span>
													<h3 className="mb-0">
														<CountUp end={approvedLeaves} />
														{/* <span >124</span> */}
													</h3>
												</div>
												<div className="w_chart">
													<span
														ref={this.sparkline2}
														id="mini-bar-chart2"
														className="mini-bar-chart"
													/>
												</div>
											</div>
										</div>
									</div>
									<div className="col-lg-3 col-md-6">
										<div className="card">
											<div className="card-body w_sparkline">
												<div className="details">
													<span>Rejected Leaves</span>
													<h3 className="mb-0 counter">	<CountUp end={rejectedLeaves} /></h3>
												</div>
												<div className="w_chart">
													<span
														ref={this.sparkline3}
														id="mini-bar-chart3"
														className="mini-bar-chart"
													/>
												</div>
											</div>
										</div>
									</div>
									<div className="col-lg-3 col-md-6">
										<div className="card">
											<div className="card-body w_sparkline">
												<div className="details">
													<span>Pending Leaves</span>
													<h3 className="mb-0 counter">	<CountUp end={pendingLeaves} /></h3>
												</div>
												<div className="w_chart">
													<span
														ref={this.sparkline4}
														id="mini-bar-chart4"
														className="mini-bar-chart"
													/>
												</div>
											</div>
										</div>
									</div>
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
													<form>
														<div className="input-group">
															<input
																type="text"
																className="form-control form-control-sm"
																placeholder="Search something..."
																name="s"
															/>
															<span className="input-group-btn ml-2">
																<button className="btn btn-icon btn-sm" type="submit">
																	<span className="fe fe-search" />
																</button>
															</span>
														</div>
													</form>
												</div>
											</div>
											<div className="card-body">
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
															{employeeData.length > 0 ? (
																employeeData.map((employee, index) => (
																	<tr key={index}>
																		<td className="w40">
																			<label className="custom-control custom-checkbox">
																				<input
																					type="checkbox"
																					className="custom-control-input"
																					name="example-checkbox1"
																					defaultValue="option1"
																				/>
																				<span className="custom-control-label">
																					&nbsp;
																				</span>
																			</label>
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
																		<td>{employee.job_role}</td>
																		<td>
																			<button 
																				type="button"
																				className="btn btn-icon btn-sm"
																				title="View"
																				onClick={() => this.viewEmployee()}
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
											</div>
										</div>
									</div>
									<div className="tab-pane fade" id="Employee-Request" role="tabpanel">
										<div className="card">
											<div className="card-body">
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
															{employeeLeavesData.length > 0 ? (
																employeeLeavesData.map((leave, index) => (
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
											</div>
										</div>
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
										value={this.state.employee_id || 6}
										onChange={this.handleInputChangeForAddLeaves}
									/>
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
									<div className="col-sm-6 col-md-6">
										<div className="form-group">
											<label className="form-label">Status</label>
											<select 
												name="status"
												className="form-control"
												id='status'
												onChange={this.handleLeaveStatus}
												value={this.state.status}
											>
												<option value="">Select Status</option>
												<option value="approved" >Approved</option>
												<option value="pending" >Pending</option>
												<option value="rejected" >Rejected</option>
											</select>
										</div>
									</div>
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
														<option value="">Select Status</option>
														<option value="approved" >Approved</option>
														<option value="pending" >Pending</option>
														<option value="rejected" >Rejected</option>
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