import React, { Component } from 'react';
import { connect } from 'react-redux';

class Users extends Component {
	constructor(props) {
		super(props);
		this.state = {
			logged_in_employee_id: null,
			logged_in_employee_role: null,
			employeeId: "",
			firstName: "",
			lastName: "",
			email: "",
			mobileNo: "",
			selectedRole: "",
			username: "",
			password: "",
			confirmPassword: "",
			users: [],
			selectedUser: {
				role: '',
			},
			deleteUser: null,
			error: null,
			searchQuery: "",
			currentPage: 1,
            dataPerPage: 10,
		};
	}

	componentDidMount() {
		if (window.user) {
			this.setState({
				logged_in_employee_id: window.user.id,
				logged_in_employee_role: window.user.role,
			});
		}

		// Make the GET API call when the component is mounted
		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php`)
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
			  	this.setState({ users: data.data, allUsers: data.data });
			} else {
			  	this.setState({ error: data.message });
			}
		})
		.catch(err => {
			this.setState({ error: 'Failed to fetch data' });
			console.error(err);
		});
	}

	// Handle input changes
    handleInputChangeForAddUser = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

	handleSelectChange = (event) => {
		const { name, value } = event.target;
		// Update state for the selected user
        this.setState((prevState) => ({
            selectedUser: {
                ...prevState.selectedUser,
                [name]: value,
            },
        }));
		this.setState({
            selectedRole: value, // Update selectedRole in state
        });
    };

	// Add department data API call
    addUser = () => {
        const {logged_in_employee_id, logged_in_employee_role, employeeId, firstName, lastName, email, mobileNo, selectedRole, username, confirmPassword} = this.state;

        // Validate form inputs
        if (!employeeId || !firstName || !email || !username) {
            alert("Please fill in all fields");
            return;
        }

        const addUserData = new FormData();
        addUserData.append('code', employeeId);
        addUserData.append('first_name', firstName);
        addUserData.append('last_name', lastName);
        addUserData.append('email', email);
        addUserData.append('mobile_no1', mobileNo);
        addUserData.append('selected_role', selectedRole);
        addUserData.append('username', username);
        addUserData.append('password', confirmPassword);
		addUserData.append('logged_in_employee_id', logged_in_employee_id);
		addUserData.append('logged_in_employee_role', logged_in_employee_role);

        // API call to add user
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=add`, {
            method: "POST",
            body: addUserData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                // Update the department list
                this.setState((prevState) => ({
                    users: [...(prevState.users || []), data.data], // Assuming the backend returns the new department
                    employeeId: "",
                    firstName: "",
                    lastName: "",
					email: "",
					mobileNo: "",
					selectedRole:"",
					username: "",
					password: "",
					confirmPassword: ""
                }));
            } else {
                console.log("Failed to add user");
            }
        })
        .catch((error) => console.error("Error:", error));
    };

	// Handle edit button click
    handleEditClick = (user) => {
        this.setState({ selectedUser: user });
    };

	// Handle input change for editing fields
    handleInputChangeForEditUser = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            selectedUser: {
                ...prevState.selectedUser,
                [name]: value, // Dynamically update the field
            },
        }));
    };

	// Update/Edit User profile (API Call)
	updateProfile = () => {
        const {logged_in_employee_id, logged_in_employee_role, selectedUser } = this.state;
        if (!selectedUser) return;

		const updateProfileData = new FormData();
        // updateProfileData.append('employee_id', selectedUser.employeeId);
        updateProfileData.append('first_name', selectedUser.first_name);
        updateProfileData.append('last_name', selectedUser.last_name);
        updateProfileData.append('email', selectedUser.email);
        updateProfileData.append('selected_role', selectedUser.role);
        updateProfileData.append('job_role', selectedUser.job_role);
        updateProfileData.append('logged_in_employee_id', logged_in_employee_id);
        updateProfileData.append('logged_in_employee_role', logged_in_employee_role);

        // Example API call
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${selectedUser.id}`, {
            method: 'POST',
            body: updateProfileData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                this.setState((prevState) => {
                    // Update the existing department in the array
                    const updatedUserData = prevState.users.map((user) =>
                        user.id === selectedUser.id ? { ...user, ...data.data } : user
                    );
                
                    return {
                        users: updatedUserData,
                    };
                });

                document.querySelector("#editUserModal .close").click();
                // Optionally reload the department data here
            } else {
                console.log('Failed to update user!');
            }
        })
        .catch((error) => console.error('Error updating user:', error));
    };

	openDeleteModal = (userId) => {
        this.setState({
            deleteUser: userId,
        });
    };

	confirmDelete = () => {
        const { deleteUser, currentPage, users, dataPerPage, logged_in_employee_id, logged_in_employee_role} = this.state;
      
        if (!deleteUser) return;

		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=delete`, {
          	method: 'DELETE',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id: deleteUser,
				logged_in_employee_id: logged_in_employee_id,
				logged_in_employee_role: logged_in_employee_role,
			}),
        })
        .then((response) => response.json())
        .then((data) => {
			if (data.status === "success") {
				// Update users state after deletion
				const updatedUsers = users.filter((d) => d.id !== deleteUser);

				// Calculate the total pages after deletion
				const totalPages = Math.ceil(updatedUsers.length / dataPerPage);
	
				// Adjust currentPage if necessary (if we're on a page that no longer has data)
				let newPage = currentPage;
				if (updatedUsers.length === 0) {
					newPage = 1;
				} else if (currentPage > totalPages) {
					newPage = totalPages;
				}

				this.setState({
					users: updatedUsers,
					successMessage: "User deleted successfully",
					showSuccess: true,
					currentPage: newPage, // Update currentPage to the new page
					deleteUser: null,  // Clear the deleteUser state
				});
				document.querySelector("#deleteUserModal .close").click();
			} else {
				alert('Failed to delete department.');
			}
        })
        .catch((error) => console.error('Error:', error));
    };

	// Handle Pagination
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.users.length / this.state.dataPerPage);
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

	// Add searching user by name and email
	handleSearch = (event) => {
        const query = event.target.value.toLowerCase(); // Get search input
        this.setState({ searchQuery: query }, () => {
			if (query === "") {
				// If search is empty, reset users to the original list
				this.setState({ users: this.state.allUsers, currentPage: 1 });
			} else {
				const filtered = this.state.allUsers.filter(user => {
					return (
						user.first_name.toLowerCase().includes(query) ||
						user.last_name.toLowerCase().includes(query) ||
						`${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`.includes(query) ||  
						user.email.toLowerCase().includes(query)
					);
				});
				this.setState({ users: filtered, currentPage: 1 });
			}
        });
    };

	render() {

		const { fixNavbar } = this.props;
		const { users, error, selectedUser, currentPage, dataPerPage } = this.state;

		// Pagination Logic
        const indexOfLastImage = currentPage * dataPerPage;
        const indexOfFirstImage = indexOfLastImage - dataPerPage;
        const currentUsers = users.slice(indexOfFirstImage, indexOfLastImage);

        const totalPages = Math.ceil(users.length / dataPerPage);
		return (
			<>
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
						<div className="container-fluid">
							<div className="d-flex justify-content-between align-items-center">
								<ul className="nav nav-tabs page-header-tab">
									<li className="nav-item">
										<a
											className="nav-link active"
											id="user-tab"
											data-toggle="tab"
											href="#user-list"
										>
											List
										</a>
									</li>
									<li className="nav-item">
										<a className="nav-link" id="user-tab" data-toggle="tab" href="#user-add">
											Add New
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="section-body mt-3">
						<div className="container-fluid">
							<div className="tab-content mt-3">
								<div className="tab-pane fade show active" id="user-list" role="tabpanel">
									<div className="card">
										<div className="card-header">
											<h3 className="card-title">User List</h3>
											<div className="card-options">
												<div className="input-icon ml-2">
													<span className="input-icon-addon">
														<i className="fe fe-search" />
													</span>
													<input
														type="text"
														className="form-control"
														placeholder="Search user..."
														name="s"
														value={this.state.searchQuery}
														onChange={this.handleSearch}
													/>
												</div>
											</div>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-striped table-hover table-vcenter text-nowrap mb-0">
													<thead>
														<tr>
															<th className="w60">Name</th>
															<th />
															<th>Role</th>
															<th>Created Date</th>
															<th>Position</th>
															<th className="w100">Action</th>
														</tr>
													</thead>
													<tbody>
														{currentUsers.length > 0 ? (
															currentUsers.map((user, index) => (
																<tr key={index}>
																	<td className="width45">
																		<span
																			className="avatar avatar-blue"
																			data-toggle="tooltip"
																			data-placement="top"
																			data-original-title="Avatar Name"
																		>
																			{user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
																		</span>
																	</td>
																	<td>
																		<h6 className="mb-0">{`${user.first_name} ${user.last_name}`}</h6>
																		<span>{user.email}</span>
																	</td>
																	<td>
																		<span className={
																			`tag ${
																				user.role === 'super_admin'
																				  ? 'tag-danger'
																				  : user.role === 'admin'
																				  ? 'tag-info' : user.role === null ? 'tag-default'
																				  : 'tag-default'
																			  }`}
																		>{/* {user.role.split('_')
																			.map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')} */}
																			{user.role 
																			? user.role.split('_')
																				.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
																				.join(' ')
																			: 'No Role'}
																		</span>
																	</td>
																	<td>
																	{new Intl.DateTimeFormat('en-US', {
																			day: '2-digit',
																			month: 'short',
																			year: 'numeric',
																		}).format(new Date(user.created_at))}
																	</td>
																	<td>{user.job_role}</td>
																	<td>
																		<button 
																			type="button"
																			className="btn btn-icon"
																			title="Edit"
																			data-toggle="modal"
																			data-target="#editUserModal"
																			onClick={() => this.handleEditClick(user)}
																		>
																			<i className="fa fa-edit" />
																		</button>
																		<button 
																			type="button"
																			className="btn btn-icon js-sweetalert"
																			title="Delete"
																			data-type="confirm"
																			onClick={() => this.openDeleteModal(user.id)}
																			data-toggle="modal"
																			data-target="#deleteUserModal"
																		>
																			<i className="fa fa-trash-o text-danger" />
																		</button>
																	</td>
																</tr>
															))
														): (
															!error && <tr><td>No users found</td></tr>
														)}
													</tbody>
												</table>
											</div>
										</div>
									</div>

									{/* Only show pagination if there are users */}
									{totalPages > 1 && (
										<nav aria-label="Page navigation">
											<ul className="pagination mb-0 justify-content-end">
												<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
													<button className="page-link" onClick={() => this.handlePageChange(currentPage - 1)}>
														Previous
													</button>
												</li>
												{[...Array(totalPages)].map((_, i) => (
													<li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
														<button className="page-link" onClick={() => this.handlePageChange(i + 1)}>
															{i + 1}
														</button>
													</li>
												))}
												<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
													<button className="page-link" onClick={() => this.handlePageChange(currentPage + 1)}>
														Next
													</button>
												</li>
											</ul>
										</nav>
									)}
								</div>
								<div className="tab-pane fade" id="user-add" role="tabpanel">
									<div className="card">
										<div className="card-body">
											<div className="row clearfix">
												<div className="col-lg-12 col-md-12 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className="form-control"
															placeholder="Employee ID *"
															name="employeeId"
                                                    		value={this.state.employeeId}
                                                    		onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-lg-6 col-md-6 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className="form-control"
															placeholder="First Name *"
															name='firstName'
															value={this.state.firstName}
															onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-lg-6 col-md-6 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className="form-control"
															placeholder="Last Name"
															name='lastName'
															value={this.state.lastName}
															onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className="form-control"
															placeholder="Email ID *"
															name='email'
															value={this.state.email}
															onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className="form-control"
															placeholder="Mobile No"
															name='mobileNo'
															value={this.state.mobileNo}
															onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<select
															className="form-control show-tick"
															value={this.state.selectedRole}  // Bind value to state
															onChange={this.handleSelectChange}  // Update state on change
															name="selectedRole"
														>
															<option>Select Role Type</option>
															<option value="super_admin">Super Admin</option>
															<option value="admin">Admin</option>
															<option value="employee">Employee</option>
														</select>
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<input
															type="text"
															className="form-control"
															placeholder="Username *"
															name='username'
															value={this.state.username}
															onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<input
															type="password"
															className="form-control"
															placeholder="Password"
															name='password'
															value={this.state.password}
															onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-md-4 col-sm-12">
													<div className="form-group">
														<input
															type="password"
															className="form-control"
															placeholder="Confirm Password"
															name='confirmPassword'
															value={this.state.confirmPassword}
															onChange={this.handleInputChangeForAddUser}
														/>
													</div>
												</div>
												<div className="col-12">
													<hr className="mt-4" />
													<h6>Module Permission</h6>
													<div className="table-responsive">
														<table className="table table-striped">
															<thead>
																<tr>
																	<th />
																	<th>Read</th>
																	<th>Write</th>
																	<th>Delete</th>
																</tr>
															</thead>
															<tbody>
																<tr>
																	<td>Super Admin</td>
																	<td>
																		<label className="custom-control custom-checkbox">
																			<input
																				type="checkbox"
																				className="custom-control-input"
																				name="example-checkbox1"
																				defaultValue="option1"
																				defaultChecked
																			/>
																			<span className="custom-control-label">
																				&nbsp;
																			</span>
																		</label>
																	</td>
																	<td>
																		<label className="custom-control custom-checkbox">
																			<input
																				type="checkbox"
																				className="custom-control-input"
																				name="example-checkbox1"
																				defaultValue="option1"
																				defaultChecked
																			/>
																			<span className="custom-control-label">
																				&nbsp;
																			</span>
																		</label>
																	</td>
																	<td>
																		<label className="custom-control custom-checkbox">
																			<input
																				type="checkbox"
																				className="custom-control-input"
																				name="example-checkbox1"
																				defaultValue="option1"
																				defaultChecked
																			/>
																			<span className="custom-control-label">
																				&nbsp;
																			</span>
																		</label>
																	</td>
																</tr>
																<tr>
																	<td>Admin</td>
																	<td>
																		<label className="custom-control custom-checkbox">
																			<input
																				type="checkbox"
																				className="custom-control-input"
																				name="example-checkbox1"
																				defaultValue="option1"
																				defaultChecked
																			/>
																			<span className="custom-control-label">
																				&nbsp;
																			</span>
																		</label>
																	</td>
																	<td>
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
																	<td>
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
																</tr>
																<tr>
																	<td>Employee</td>
																	<td>
																		<label className="custom-control custom-checkbox">
																			<input
																				type="checkbox"
																				className="custom-control-input"
																				name="example-checkbox1"
																				defaultValue="option1"
																				defaultChecked
																			/>
																			<span className="custom-control-label">
																				&nbsp;
																			</span>
																		</label>
																	</td>
																	<td>
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
																	<td>
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
																</tr>
																<tr>
																	<td>HR Admin</td>
																	<td>
																		<label className="custom-control custom-checkbox">
																			<input
																				type="checkbox"
																				className="custom-control-input"
																				name="example-checkbox1"
																				defaultValue="option1"
																				defaultChecked
																			/>
																			<span className="custom-control-label">
																				&nbsp;
																			</span>
																		</label>
																	</td>
																	<td>
																		<label className="custom-control custom-checkbox">
																			<input
																				type="checkbox"
																				className="custom-control-input"
																				name="example-checkbox1"
																				defaultValue="option1"
																				defaultChecked
																			/>
																			<span className="custom-control-label">
																				&nbsp;
																			</span>
																		</label>
																	</td>
																	<td>
																		<label className="custom-control custom-checkbox">
																			<input
																				type="checkbox"
																				className="custom-control-input"
																				name="example-checkbox1"
																				defaultValue="option1"
																				defaultChecked
																			/>
																			<span className="custom-control-label">
																				&nbsp;
																			</span>
																		</label>
																	</td>
																</tr>
															</tbody>
														</table>
													</div>
													<button
														type="button"
														className="btn btn-primary"
														onClick={this.addUser}
													>
														Add
													</button>
													<button
														type="button"
														className="btn btn-secondary"
														data-dismiss="modal"
													>
														CLOSE
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Edit User Modal */}
					<div className="modal fade" id="editUserModal" tabIndex={-1} role="dialog" aria-labelledby="editUserModalLabel">
						<div className="modal-dialog" role="document">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" id="editUserModalLabel">Edit User</h5>
									<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
								</div>
								<form>
									<div className="modal-body">
										{selectedUser ? (
											<div className="row clearfix">
												<div className="col-md-12">
													<div className="form-group">
														<label className="form-label">First Name</label>
														<input
															type="text"
															className="form-control"
															value={selectedUser?.first_name || ""} 
															onChange={this.handleInputChangeForEditUser}
                                                            name="first_name"
														/>
													</div>
												</div>
												<div className="col-md-12">
													<div className="form-group">
														<label className="form-label">Last Name</label>
														<input
															type="text"
															className="form-control"
															value={selectedUser?.last_name || ""} 
															onChange={this.handleInputChangeForEditUser}
                                                            name="last_name"
														/>
													</div>
												</div>
												<div className="col-md-12">
													<div className="form-group">
														<label className="form-label">Email Address</label>
														<input
															type="text"
															className="form-control"
															value={selectedUser?.email || ""} 
															onChange={this.handleInputChangeForEditUser}
                                                            name="email"
														/>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-group">
														<label className="form-label">Role</label>
														<select
															className="form-control show-tick"
															value={selectedUser?.role || ""}  // Bind value to state
															onChange={this.handleSelectChange}  // Update state on 
															name="role"
														>
															<option value="">Select Role Type</option>
															<option value="super_admin">Super Admin</option>
															<option value="admin">Admin</option>
															<option value="employee">Employee</option>
														</select>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-group">
														<label className="form-label">Position</label>
														<input
															type="text"
															className="form-control"
															value={selectedUser?.job_role || ""} 
															onChange={this.handleInputChangeForEditUser}
                                                            name="job_role"
														/>
													</div>
												</div>
											</div>
										) : (
											<p>Loading user data...</p>
										)}
									</div>
									<div className="modal-footer">
										<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
										<button type="button" onClick={this.updateProfile} className="btn btn-primary">Update Profile</button>
									</div>
								</form>
							</div>
						</div>
					</div>

					{/* Delete User Model */}
					<div className="modal fade" id="deleteUserModal" tabIndex={-1} role="dialog" aria-labelledby="deleteUserModalLabel">
						<div className="modal-dialog" role="document">
							<div className="modal-content">
								<div className="modal-header" style={{ display: 'none' }}>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
								<div className="modal-body">
									<div className="row clearfix">
										<p>Are you sure you want to delete the user?</p>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
									<button type="button" onClick={this.confirmDelete}  className="btn btn-danger">Delete</button>
								</div>
							</div>
						</div>
					</div>
				</div>

			</>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Users);