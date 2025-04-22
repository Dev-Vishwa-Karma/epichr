import React, { Component } from 'react';
import { connect } from 'react-redux';
class Activities extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activities: [],
			error: null,
			employeeData: [],
			selectedStatus: "",
			selectedEmployee: "",
			breakReason: "",
			activityError: null,
			activitySuccess: null,
			loading: true,
			isBreakedIn: false,
			breakOutError: null
		};
	}

	componentDidMount() {

		let apiUrl = '';

		if (window.user.role === 'super_admin' || window.user.role === 'admin') {
			apiUrl = `${process.env.REACT_APP_API_URL}/activities.php`;
		}
		else {
			apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?user_id=${window.user.id}`;
		}

		fetch(apiUrl, {
			method: "GET",
		})
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ activities: data.data, loading: false });
				} else {
					this.setState({ error: data.message, loading: false });
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch data' });
				console.error(err);
			});

		/** Get employees list */
		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
			method: "GET",
		})
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ employeeData: data.data });
				} else {
					this.setState({ error: data.message });
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch data' });
				console.error(err);
			});

		/** Get employees list */
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=get_break_status&user_id=${window.user.id}`)
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ isBreakedIn: true });
				} else {
					this.setState({ isBreakedIn: false });
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch data' });
				console.error(err);
			});
	}

	handleBreakOut = () => {

		const formData = new FormData();
		formData.append('employee_id', window.user.id);
		formData.append('activity_type', 'Break');
		formData.append('description', null);
		formData.append('status', 'completed');

		// API call to add break
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState({ isBreakedIn: true, activitySuccess: data.message });
					this.componentDidMount();
					// Hide the error message after 5 seconds
					setTimeout(() => {
						this.setState({ activitySuccess: null });
					}, 5000);
				} else {
					this.setState({ breakOutError: data.message });
					// Hide the error message after 5 seconds
					setTimeout(() => {
						this.setState({ breakOutError: null });
					}, 5000);
				}
			})
			.catch((error) => {
				// Stop loader in case of error
				this.setState({ activityError: 'Something went wrong. Please try again.' });
				// Hide the error message after 5 seconds
				setTimeout(() => {
					this.setState({ activityError: null });
				}, 5000);
			});
	};

	handleSaveBreakIn = () => {

		if (!this.state.breakReason) {
			this.setState({ activityError: 'Please provide the reason for your break' });
			// Hide the error message after 5 seconds
			setTimeout(() => {
				this.setState({ activityError: null });
			}, 5000)
			return;
		}

		const formData = new FormData();
		formData.append('employee_id', window.user.id);
		formData.append('activity_type', 'Break');
		formData.append('description', this.state.breakReason);
		formData.append('status', 'active');

		// API call to save the report and punch-out
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState({ isBreakedIn: false, breakReason: '', activitySuccess: data.message });
					document.querySelector("#addBreakReasonModal .close").click();
					this.componentDidMount();
					// Hide the success message after 5 seconds
					setTimeout(() => {
						this.setState({ activitySuccess: null });
					}, 5000);
				} else {
					this.setState({ activityError: data.message });
					// Hide the error message after 5 seconds
					setTimeout(() => {
						this.setState({ activityError: null });
					}, 5000);
				}
			})
			.catch((error) => {
				// Stop loader in case of error
				this.setState({ activityError: 'Something went wrong. Please try again.' });
				// Hide the error message after 5 seconds
				setTimeout(() => {
					this.setState({ activityError: null });
				}, 5000);
			});
	};


	// Handle dropdown change for employee
	handleEmployeeChange = (event) => {
		this.setState({ selectedEmployee: event.target.value });
	};

	// Handle dropdown change
	handleStatusChange = (event) => {
		this.setState({ selectedStatus: event.target.value });
	};

	// Handle textarea input change
	handleReasonChange = (event) => {
		this.setState({ breakReason: event.target.value });
	};

	addActivityForEmployee = () => {
		const { selectedEmployee, selectedStatus, breakReason } = this.state;

		// Reset error and success messages
		this.setState({ activityError: null, activitySuccess: null });

		// Validate form inputs
		if (!selectedEmployee && !selectedStatus) {
			this.setState({ activityError: 'Please select an employee and status' });
			// Hide the error message after 5 seconds
			setTimeout(() => {
				this.setState({ activityError: null });
			}, 5000)
			return;
		}

		if (!selectedEmployee) {
			this.setState({ activityError: 'Please select an employee' });
			// Hide the error message after 5 seconds
			setTimeout(() => {
				this.setState({ activityError: null });
			}, 5000)
			return;
		}

		if (!selectedStatus) {
			this.setState({ activityError: 'Please select a status' });
			// Hide the error message after 5 seconds
			setTimeout(() => {
				this.setState({ activityError: null });
			}, 5000)
			return;
		}

		if (selectedStatus === 'active' && !breakReason) {
			this.setState({ activityError: 'Please enter the reason for break' });
			// Hide the error message after 5 seconds
			setTimeout(() => {
				this.setState({ activityError: null });
			}, 5000)
			return;
		}

		// Start loader when the login process begins
		this.setState({ loading: true });
		const formData = new FormData();
		formData.append('employee_id', selectedEmployee);
		formData.append('activity_type', 'Break');
		formData.append('description', breakReason);
		formData.append('status', selectedStatus);
		formData.append('created_by', window.user.id); //created by admin
		formData.append('updated_by', window.user.id); //updated by admin

		// API call to add break
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-admin`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				// Stop loader when API response is received
				this.setState({ loading: false });

				if (data.status === "success") {
					this.setState({ activitySuccess: data.message });
					// Close the modal
					document.querySelector("#addBreakModal .close").click();
					this.componentDidMount();
					// Hide the success message after 5 seconds
					setTimeout(() => {
						this.setState({ activitySuccess: null });
					}, 5000);
				} else {
					this.setState({ activityError: data.message });
					console.log("Failed to add break data");

					// Hide the error message after 5 seconds
					setTimeout(() => {
						this.setState({ activityError: null });
					}, 5000);
				}
			})
			.catch((error) => {
				this.setState({ loading: false });
				// Stop loader in case of error
				this.setState({ activityError: 'Something went wrong. Please try again.' });
				console.error("Error:", error);
				// Hide the error message after 5 seconds
				setTimeout(() => {
					this.setState({ activityError: null });
				}, 5000);
			});
	};

	render() {
		const { fixNavbar } = this.props;
		const { activities, error, employeeData, selectedStatus, selectedEmployee, breakReason, activityError, activitySuccess, loading, isBreakedIn, breakOutError } = this.state;
		return (
			<>
				{/* <link rel="stylesheet" href="../assets/plugins/summernote/dist/summernote.css" /> */}
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
						<div className="container-fluid">
							<div className="row clearfix">
								<div className="col-md-12">
									<div className="card">
										{/* Display activity success message outside the modal */}
										{activitySuccess && (
											<div className="alert alert-success mb-0">{activitySuccess}</div>
										)}
										{/* Display activity error message outside the modal */}
										{breakOutError && (
											<div className="alert alert-danger mb-0">{breakOutError}</div>
										)}
										<div className="card-header bline d-flex justify-content-between align-items-center">
											<h3 className="card-title">Timeline Activity</h3>
											{window.user && window.user.role !== 'employee' && (
												<div>
													<button style={{ float: "right" }} type="button" className="btn btn-primary" data-toggle="modal" data-target="#addBreakModal"><i className="fe fe-plus mr-2" />Add</button>
												</div>
											)}
											{window.user && window.user.role === 'employee' && (
												<div>
													<button style={{ float: "right" }} className="btn btn-primary" onClick={isBreakedIn ? this.handleBreakOut : this.handleBreakIn} data-toggle={isBreakedIn ? "" : "modal"} data-target={isBreakedIn ? "" : "#addBreakReasonModal"}>
														{isBreakedIn ? 'Break Out' : 'Break In'}
													</button>
												</div>
											)}
										</div>
										{loading ? (
											<div className="dimmer active p-5">
												<div className="loader" />
											</div>
										) : (
											<div className="card-body">
												<div className="summernote">
												</div>
												{activities.length > 0 ? (
													activities.map((activity, index) => (
														<>
															{/* In Time Entry */}
															{activity.activity_type === 'Break' && (
																<div className="timeline_item ">
																	<img
																		className="tl_avatar"
																		src="../assets/images/xs/avatar1.jpg"
																		alt="fake_url"
																	/>
																	<span>
																		<a href={() => false}>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
																		<small className="float-right text-right">
																			{activity.in_time}
																		</small>
																	</span>
																	<h6 className="font600">
																		(Break In) {activity.description}
																	</h6>

																	<div className="msg">
																		{activity.created_by && (
																			<a href={() => false} class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Created by System Admin</a>
																		)}
																	</div>
																</div>
															)}
															{/* Out Time Entry */}
															{activity.activity_type === 'Break' && activity.out_time && (
																<>
																	<div className="duration text-center">
																		------ {activity.duration} ------
																	</div>
																	<div className="timeline_item ">
																		<img
																			className="tl_avatar"
																			src="../assets/images/xs/avatar1.jpg"
																			alt="fake_url"
																		/>
																		<span>
																			<a href={() => false}>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
																			<small className="float-right text-right">
																				{activity.out_time}
																			</small>
																		</span>
																		<h6 className="font600">
																			Break out
																		</h6>
																		<div className="msg">
																			{activity.updated_by && (
																				<a href={() => false} class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Edited by System Admin</a>
																			)}
																		</div>
																	</div>
																</>
															)}

															{/* In Time Entry Punch */}
															{activity.activity_type === 'Punch' && (
																<div className="timeline_item ">
																	<img
																		className="tl_avatar"
																		src="../assets/images/xs/avatar1.jpg"
																		alt="fake_url"
																	/>
																	<span>
																		<a href={() => false}>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
																		<small className="float-right text-right">
																			{activity.in_time}
																		</small>
																	</span>
																	<h6 className="font600">
																		has started his day
																	</h6>

																	<div className="msg">
																		{activity.created_by && (
																			<a href={() => false} class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Created by System Admin</a>
																		)}
																	</div>
																</div>
															)}
															{/* Out Time Entry */}
															{activity.activity_type === 'Punch' && activity.out_time && (
																<>
																	<div className="duration text-center">
																		------ {activity.duration} ------
																	</div>
																	<div className="timeline_item ">
																		<img
																			className="tl_avatar"
																			src="../assets/images/xs/avatar1.jpg"
																			alt="fake_url"
																		/>
																		<span>
																			<a href={() => false}>{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
																			<small className="float-right text-right">
																				{activity.out_time}
																			</small>
																		</span>
																		<h6 className="font600">
																			has ended his day
																		</h6>
																		<div className="msg">
																			{activity.updated_by && (
																				<a href={() => false} class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Edited by System Admin</a>
																			)}
																		</div>
																	</div>
																</>
															)}
														</>
													))
												) : (
													error && <p>{error}</p>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Add Break Modal */}
					<div className="modal fade" id="addBreakModal" tabIndex={-1} role="dialog" aria-labelledby="addBreakModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
						<div className="modal-dialog" role="dialog">
							<div className={`modal-content ${loading ? 'dimmer active' : 'dimmer'}`}>
								<div className="modal-header">
									<h5 className="modal-title" id="addBreakModalLabel">Add Activity for Employee</h5>
									<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
									{loading && <div className="loader"></div>}
								</div>
								<div className="dimmer-content">
									<div className="modal-body">
										{/* Display error message inside the modal */}
										{activityError && <div className="alert alert-danger mb-0">{activityError}</div>}
										<div className="row clearfix">
											<div className="col-md-12">
												<div className="form-group">
													<select className="form-control" value={selectedEmployee} onChange={this.handleEmployeeChange}>
														<option value="">Select Employee</option>
														{employeeData.length > 0 ? (
															employeeData.map((employee, index) => (
																<option key={index} value={employee.id}>
																	{`${employee.first_name} ${employee.last_name}`}
																</option>
															))
														) : (
															<option value="">No Employees Available</option>
														)}
													</select>
												</div>
											</div>
											<div className="col-md-12">
												<div className="form-group">
													<select className="form-control" value={selectedStatus} onChange={this.handleStatusChange}>
														<option value="">Select Status</option>
														<option value="active">Break In</option>
														<option value="completed">Break Out</option>
													</select>
												</div>
											</div>
											{selectedStatus === "active" && (
												<div className="col-md-12">
													<div className="form-group">
														<textarea
															className="form-control"
															placeholder="Please provide the reason for your break"
															value={breakReason}
															onChange={this.handleReasonChange}
															rows="10"
															cols="50"
														/>
													</div>
												</div>
											)}
										</div>
									</div>
									<div className="modal-footer">
										<button type="button" className="btn btn-primary" onClick={this.addActivityForEmployee}>Save changes</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Add Break reason Modal for loggedin employee */}
					<div className="modal fade" id="addBreakReasonModal" tabIndex={-1} role="dialog" aria-labelledby="addBreakReasonModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
						<div className="modal-dialog" role="dialog">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" id="addBreakReasonModalLabel">Break Reason</h5>
									<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
								</div>
								<div className="dimmer-content">
									<div className="modal-body">
										{/* Display error message inside the modal */}
										{activityError && <div className="alert alert-danger mb-0">{activityError}</div>}
										<div className="row clearfix">
											<div className="col-md-12">
												<div className="form-group">
													<textarea
														className="form-control"
														placeholder="Please provide the reason for your break"
														value={breakReason}
														onChange={this.handleReasonChange}
														rows="10"
														cols="50"
													/>
												</div>
											</div>
										</div>
									</div>
									<div className="modal-footer">
										<button type="button" className="btn btn-primary" onClick={this.handleSaveBreakIn}>Save changes</button>
									</div>
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
export default connect(mapStateToProps, mapDispatchToProps)(Activities);