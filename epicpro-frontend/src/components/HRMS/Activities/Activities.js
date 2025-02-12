import React, { Component } from 'react';
import { connect } from 'react-redux';
import Ckeditor from '../../common/ckeditor';
import { useState } from "react";
class Activities extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activities: [],
			error: null,
			employeeData: [],
			selectedStatus: "", // State for dropdown selection
			selectedEmployee: "",
			breakReason: ""
		};
	}

	componentDidMount() {

		let apiUrl = '';

		if (window.user.role == 'super_admin' || window.user.role == 'admin') {
			apiUrl = `${process.env.REACT_APP_API_URL}/activities.php`;
		} else {
			apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?user_id=${window.user.id}`;
		}

		fetch(apiUrl)
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					this.setState({ activities: data.data });
				} else {
					this.setState({ error: data.message });
				}
			})
			.catch(err => {
				this.setState({ error: 'Failed to fetch data' });
				console.error(err);
			});

		/** Get employees list */
		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php`)
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
	}

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

	addBreak = () => {
		const { selectedEmployee, selectedStatus, breakReason } = this.state;

		// Validate form inputs
		if (window.user.role == 'super_admin' || window.user.role == 'admin') {
			if (!selectedEmployee || !selectedStatus) {
				alert("All the fields are required");
				return;
			}
		} else {
			if (!selectedStatus) {
				alert("All the fields are required!");
				return;
			}
		}

		const formData = new FormData();

		if (window.user.role == 'super_admin' || window.user.role == 'admin') {
			formData.append('employee_id', selectedEmployee);
		} else {
			formData.append('employee_id', window.user.id);//loggedin user
		}

		formData.append('break_status', selectedStatus);
		formData.append('break_reason', breakReason);

		// API call to add break
		fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=add`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					alert(data.message);
					// Close the modal
					document.querySelector("#addBreakModal .close").click();
					this.componentDidMount();
				} else {
					alert(data.message);
					console.log("Failed to add break data");
				}
			})
			.catch((error) => console.error("Error:", error));
	};

	render() {
		const { fixNavbar } = this.props;
		const { activities, error, employeeData, selectedStatus, selectedEmployee, breakReason } = this.state;
		return (
			<>
				{/* <link rel="stylesheet" href="../assets/plugins/summernote/dist/summernote.css" /> */}
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
						<div className="container-fluid">
							<div className="row clearfix">
								<div className="col-md-12">
									<div className="card">
										<div className="card-header">
											<h3 className="card-title">Timeline Activity</h3>
										</div>
										<div><button style={{ float: "right" }} type="button" className="btn btn-primary" data-toggle="modal" data-target="#addBreakModal"><i className="fe fe-plus mr-2" />Add Break</button></div>
										<div className="card-body">
											<div className="summernote">
											</div>
											{activities.length > 0 ? (
												activities.map((activity, index) => (
													<div className="timeline_item ">
														<img
															className="tl_avatar"
															src="../assets/images/xs/avatar1.jpg"
															alt="fake_url"
														/>
														<span>
															<a href="#">{activity.first_name} {activity.last_name}</a> {activity.location}
															<small className="float-right text-right">
																{activity.formatted_date}
															</small>
														</span>
														<h6 className="font600">
															({activity.break_status}) {activity.break_reason}
														</h6>
													</div>
												))
											) : (
												error && <p>{error}</p>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Add Break Modal */}
					<div className="modal fade" id="addBreakModal" tabIndex={-1} role="dialog" aria-labelledby="addBreakModalLabel" /* aria-hidden="true" */>
						<div className="modal-dialog" role="break">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" id="addBreakModalLabel">Add Break</h5>
									<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
								</div>
								<div className="modal-body">
									<div className="row clearfix">
										<div className="col-md-12">
											<div className="form-group">
												{window.user && window.user.role !== 'employee' && (
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
												)}
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
														placeholder="Reason"
														value={breakReason}
														onChange={this.handleReasonChange}
													/>
												</div>
											</div>
										)}
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
									<button type="button" className="btn btn-primary" onClick={this.addBreak}>Save changes</button>
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