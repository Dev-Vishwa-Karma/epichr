import React, { Component } from 'react';
import { connect } from 'react-redux';

class Holidays extends Component {
	constructor(props) {
		super(props);
		this.state = {
			holidays: [],
			message: null,
			showAddHolidayModal: false,
			employee_id: null,
			logged_in_user_role: null,
			event_name: "",
			event_date: "",
			errors: {
				event_name: '',
        		event_date: '',
			},
			selectedHoliday: '',
			deleteHoliday: null,
			successMessage: "",
      		errorMessage: "",
			showSuccess: false,
      		showError: false,
			currentPage: 1,
			dataPerPage: 10,
			loading: true
		};
	}

	componentDidMount(prevProps, prevState) {
		const {role, id} = window.user;
		// Get the logged in user id
		this.setState({
			employee_id: id,
			logged_in_user_role: role
		});

		// Make the GET API call when the component is mounted
		fetch(`${process.env.REACT_APP_API_URL}/events.php`, {
			method: "GET",
		})
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				const holidaysData = data.data;
				const today = new Date(); // Get today's date

				// Filter only holidays and exclude past holidays
            	const upcomingHolidays = holidaysData.filter(holiday => holiday.event_type === 'holiday' && new Date(holiday.event_date) >= today) 
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date)); // Sort by ASC order

				this.setState(
					{ holidays: upcomingHolidays, loading: false}
				);
			} else {
				this.setState({ message: data.message, loading: false });
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data', loading: false });
			// console.error(err);
		});

		if (this.state.successMessage && this.state.successMessage !== prevState.successMessage) {
			this.setState({ showSuccess: true });
			setTimeout(() => this.setState({ showSuccess: false, successMessage: '' }), 5000); // Hide after 5 seconds
		}		
	  
		if (this.state.errorMessage && this.state.errorMessage !== prevState.errorMessage) {
			this.setState({ showError: true });
			setTimeout(() => this.setState({ showError: false, errorMessage: '' }), 5000); // Hide after 5 seconds
		}
	}

	handleClose = (messageType) => {
		if (messageType === 'success') {
		  this.setState({ showSuccess: false, successMessage: '' });
		} else if (messageType === 'error') {
		  this.setState({ showError: false, errorMessage: '' });
		}
	};	

	// Function for "Add" button based on active tab
    openAddHolidayModel = () => {
		this.setState({
			selectedHoliday: null,
			event_name: '',
			event_date: '',
			errors: {},
			showAddHolidayModal: true
		});
    };

	closeAddHolidayModal = () => {
        this.setState({
			showAddHolidayModal: false,
			event_name: '',
			event_date: '',
			errors: {},
		});
    };

	// Handle input changes for add event/holiday
	handleInputChangeForAddHoliday = (event) => {
        const { name, value } = event.target;
        this.setState({
			[name]: value,
			errors: { ...this.state.errors, [name]: "" }
		});
    };

	// Validate form inputs
	validateForm = (e) => {
		e.preventDefault();
		
		let errors = { ...this.state.errors };
    	let isValid = true;

		// Check if we're editing or adding an event
		const eventData = this.state.selectedHoliday || this.state;
		const { event_name, event_date } = eventData;

		// Validate event name (only letters and spaces)
		const namePattern = /^[a-zA-Z\s]+$/;
		if (!event_name) {
			errors.event_name = "Holiday name is required.";
			isValid = false;
		} else if (!namePattern.test(event_name)) {
			errors.event_name = 'Holiday name must only contain letters and spaces.';
		  	isValid = false;
		} else {
		  	errors.event_name = '';
		}

		// Validate event date
		if (!event_date) {
			errors.event_date = "Holiday date is required.";
			isValid = false;
		} else {
		  	errors.event_date = '';
		}

		this.setState({ errors });
		return isValid;
	};

	addHoliday = (e) => {
		// Prevent default form submission behavior
		e.preventDefault();

		// Reset selectedHoliday before adding a new event
		if (this.state.selectedHoliday) {
			this.setState({
				selectedHoliday: null,
			});
		}

		if (this.validateForm(e)) {
			const { employee_id, event_name, event_date} = this.state;
			const addHolidayData = new FormData();
			addHolidayData.append('employee_id', employee_id);
			addHolidayData.append('event_name', event_name);
			addHolidayData.append('event_date', event_date);
			addHolidayData.append('event_type', 'holiday');
			// API call to add employee leave
			fetch(`${process.env.REACT_APP_API_URL}/events.php?action=add`, {
				method: "POST",
				body: addHolidayData,
			})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState((prevState) => {
						const updatedHolidayData = [data.data, ...(prevState.holidays || []) ];
						
						// Return the updated state
						return {
							holidays: updatedHolidayData,
							
							// Clear form fields after submission
							event_name: "",
							event_date: "",
							showAddHolidayModal: false,
							successMessage: 'Holiday added successfully',
							showSuccess: true,
							errors: {}, // Clear errors
						};
					});

					// Auto-hide success message after 3 seconds
					setTimeout(() => {
						this.setState({
							showSuccess: false, 
							successMessage: ''
						});
					}, 3000);
				} else {
					this.setState({
						errorMessage: "Failed to add holiday",
						showError: true
					});

					// Auto-hide error message after 3 seconds
					setTimeout(() => {
						this.setState({
							errorMessage: '',
							showError: false
						}); 
					}, 3000);
				}
			})
			.catch((error) => console.error("Error:", error));
		}
    };

	// Handle edit holiday
    handleEditClickForHoliday = (holiday) => {
		this.setState({
			selectedHoliday: holiday,
			errors: { event_name: "", event_date: "" }, // Reset errors
			errorMessage: "",
			showError: false
		});
    };

	handleInputChangeForEditHoliday = (event) => {
		const { name, value } = event.target;
		this.setState((prevState) => ({
            selectedHoliday: {
                ...prevState.selectedHoliday,
                [name]: value, // Dynamically update the field
				errors: { ...this.state.errors, [name]: "" }
            },
        }));
	}

	// Update/Edit Holiday (API Call)
	updateHoliday = (e) => {
		e.preventDefault();

		// Validate the form before proceeding
		if (!this.validateForm(e)) {
			return;
		}

        const { selectedHoliday } = this.state;
        if (!selectedHoliday) return;

		const updateHolidayData = new FormData();
        updateHolidayData.append('employee_id', selectedHoliday.employee_id);
		updateHolidayData.append('event_name', selectedHoliday.event_name);
		updateHolidayData.append('event_date', selectedHoliday.event_date);
		updateHolidayData.append('event_type', 'holiday');

        // Example API call
        fetch(`${process.env.REACT_APP_API_URL}/events.php?action=edit&event_id=${selectedHoliday.id}`, {
            method: 'POST',
            body: updateHolidayData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                this.setState((prevState) => {
                    // Update the existing department in the array
                    const updatedHolidayData = prevState.holidays.map((holiday) =>
                        holiday.id === selectedHoliday.id ? { ...holiday, ...data.data } : holiday
                    );
                
                    return {
                        holidays: updatedHolidayData,
						successMessage: 'Holiday updated successfully',
						showSuccess: true
                    };
                });

                document.querySelector("#editHolidayModal .close").click();

				// Auto-hide success message after 3 seconds
				setTimeout(() => {
					this.setState({
						showSuccess: false, 
						successMessage: ''
					});
				}, 3000);
            } else {
				document.querySelector("#editHolidayModal .close").click();

				this.setState({ 
					errorMessage: "Failed to update holiday",
					showError: true
				});

				// ✅ Auto-hide error message after 3 seconds
				setTimeout(() => {
					this.setState({
						showError: false,
						errorMessage: ''
					});
				}, 3000);
            }
        })
        .catch((error) => console.error('Error updating holiday:', error));
    };

	// Code for delete holidays
	openDeleteHolidayModal = (holidayId) => {
        this.setState({
            deleteHoliday: holidayId,
        });
    };

	confirmDelete = () => {
        const { deleteHoliday, currentPage, holidays, dataPerPage } = this.state;
      
        if (!deleteHoliday) return;

		fetch(`${process.env.REACT_APP_API_URL}/events.php?action=delete&event_id=${deleteHoliday}`, {
          	method: 'DELETE',
        })
        .then((response) => response.json())
        .then((data) => {
			if (data.status === "success") {
				// Update holidays state after deletion
				const updatedHolidays = holidays.filter((d) => d.id !== deleteHoliday);

				// Calculate the total pages after deletion
				const totalPages = Math.ceil(updatedHolidays.length / dataPerPage);
	
				// Adjust currentPage if necessary (if we're on a page that no longer has data)
				let newPage = currentPage;
				if (updatedHolidays.length === 0) {
					newPage = 1;
				} else if (currentPage > totalPages) {
					newPage = totalPages;
				}

				this.setState({
					holidays: updatedHolidays,
					successMessage: "Holiday deleted successfully",
					showSuccess: true,
					currentPage: newPage, // Update currentPage to the new page
					deleteHoliday: null,  // Clear the deleteHoliday state
				});

				document.querySelector("#deleteHolidayModal .close").click();

				setTimeout(() => {
					this.setState({
						showSuccess: false,
						successMessage: ''
					});
				}, 3000);
			} else {
				this.setState({
					errorMessage: "Failed to delete holiday",
					showError: true
				});

				setTimeout(() => {
					this.setState({
						showError: false,
						errorMessage: ''
					});
				}, 3000);
			}
        })
        .catch((error) => console.error('Error:', error));
    };

	// Handle Pagination
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.holidays.length / this.state.dataPerPage);
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

	render() {
		const { fixNavbar } = this.props;
		const { holidays, message, showAddHolidayModal, selectedHoliday, currentPage, dataPerPage, loading, logged_in_user_role} = this.state;
		// Pagination Logic
        const indexOfLastHoliday = currentPage * dataPerPage;
        const indexOfFirstHoliday = indexOfLastHoliday - dataPerPage;
        const currentHolidays = holidays.slice(indexOfFirstHoliday, indexOfLastHoliday);
		const totalPages = Math.ceil(holidays.length / dataPerPage);
		return (
			<>
				<div>
					{/* Show success and error messages */}
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
					<div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
						<div className="container-fluid">
							<div className="d-flex justify-content-end align-items-center mb-3 mt-3">
								{(logged_in_user_role === 'admin' || logged_in_user_role === 'super_admin') && (
									<div className="header-action">
										<button
											onClick={() => this.openAddHolidayModel()}
											type="button"
											className="btn btn-primary"
										>
											<i className="fe fe-plus mr-2" />Add Holiday
										</button>
									</div>
								)}
							</div>
							<div className="row">
								<div className="col-12">
									<div className="card">
										<div className='card-header'>
											<h3 className='card-title'>Holiday List</h3>	
										</div>
										{loading ? (
											<div className="card-body">
												<div className="dimmer active mb-4">
													<div className="loader" />
												</div>
											</div>
										) : ( // Show Table after loading is false
											<div className="card-body">
												<div className="table-responsive">
													<table className="table table_custom spacing5 border-style mb-0">
														<thead>
															<tr>
																<th>DAY</th>
																<th>DATE</th>
																<th>HOLIDAY</th>
																{(logged_in_user_role === 'admin' || logged_in_user_role === 'super_admin') && (
																	<th>Action</th>
																)}
															</tr>
														</thead>
														<tbody>
															{currentHolidays.length > 0 ? (
																currentHolidays
																	.filter((holiday) => holiday.event_type === 'holiday')
																	.map((holiday, index) => (
																	<tr key={index}>
																		<td>
																			<span>
																				{new Date(holiday.event_date).toLocaleDateString('en-US', { weekday: 'long' })}
																			</span>
																		</td>
																		<td>
																			<span>
																				{new Intl.DateTimeFormat('en-US', {
																					day: '2-digit',
																					month: 'short',
																					year: 'numeric',
																				}).format(new Date(holiday.event_date))}
																			</span>
																		</td>
																		<td>
																			<span>{holiday.event_name}</span>
																		</td>
																		{(logged_in_user_role === 'admin' || logged_in_user_role === 'super_admin') && (
																			<td>
																				<button 
																					type="button"
																					className="btn btn-icon btn-sm"
																					title="Edit"
																					data-toggle="modal"
																					data-target="#editHolidayModal"
																					onClick={() => this.handleEditClickForHoliday(holiday)}
																				>
																					<i className="fa fa-edit" />
																				</button>
																				<button
																					type="button"
																					className="btn btn-icon btn-sm js-sweetalert"
																					title="Delete"
																					data-type="confirm"
																					data-toggle="modal"
																					data-target="#deleteHolidayModal"
																					onClick={() => this.openDeleteHolidayModal(holiday.id)}
																				>
																					<i className="fa fa-trash-o text-danger" />
																				</button>
																			</td>
																		)}
																	</tr>
																))
															): (
																!message && <tr><td>Holidays data not found</td></tr>
															)}
														</tbody>
													</table>
												</div>
											</div>
										)}
									</div>
									{/* Only show pagination if there are holidays */}
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
							</div>
						</div>
					</div>
				</div>

				{/* Modal for Add Holiday */}
				{showAddHolidayModal && (
				<div className="modal fade show d-block" id="addHolidayModal" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Add Holiday</h5>
								<button type="button" className="close" onClick={this.closeAddHolidayModal}>
									<span>&times;</span>
								</button>
							</div>
							<form onSubmit={this.addHoliday}>
								<div className="modal-body">
									<div className="row clearfix">
										<input
											type="hidden"
											className="form-control"
											placeholder="employeeId"
											name='employeeId'
											value={this.state.employee_id}
											onChange={this.handleInputChangeForAddHoliday}
										/>
										<div className="col-md-12">
											<div className="form-group">
												<label className="form-label" htmlFor="event_name">Holiday Name</label>
												<input
													type="text"
													className={`form-control ${this.state.errors.event_name ? "is-invalid" : ""}`}
													name='event_name'
													id='event_name'
													value={this.state.event_name}
													onChange={this.handleInputChangeForAddHoliday}
												/>
												{this.state.errors.event_name && (
													<div className="invalid-feedback">{this.state.errors.event_name}</div>
												)}
											</div>
										</div>
										<div className="col-md-12">
											<div className="form-group">
												<label className="form-label" htmlFor="event_date">Holiday Date</label>
												<input
													type="date"
													className={`form-control ${this.state.errors.event_date ? "is-invalid" : ""}`}
													name='event_date'
													id='event_date'
													value={this.state.event_date}
													onChange={this.handleInputChangeForAddHoliday}
												/>
												{this.state.errors.event_date && (
													<div className="invalid-feedback">{this.state.errors.event_date}</div>
												)}
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" onClick={this.closeAddHolidayModal}>
										Close
									</button>
									<button
										type="submit"
										className="btn btn-primary"
									>
										Add Holiday
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
				)}

				{/* Modal for Update/Edit Holiday */}
				<div className="modal fade" id="editHolidayModal" tabIndex={-1} role="dialog" aria-labelledby="editHolidayModalLabel">
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Update Holiday</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close" ><span aria-hidden="true">×</span></button>
							</div>
							{selectedHoliday && (
							<form onSubmit={this.updateHoliday}>
								<div className="modal-body">
									<div className="row clearfix">
										<input
											type="hidden"
											className="form-control"
											placeholder="employeeId"
											name='employee_id'
											value={selectedHoliday?.employee_id || ""}
											onChange={this.handleInputChangeForEditHoliday}
										/>
										<div className="col-md-12">
											<div className="form-group">
												<label className="form-label" htmlFor="event_name">Holiday Name</label>
												<input
													type="text"
													className={`form-control ${this.state.errors.event_name ? "is-invalid" : ""}`}
													name='event_name'
													id='event_name'
													value={selectedHoliday?.event_name || ""}
													onChange={this.handleInputChangeForEditHoliday}
												/>
												{this.state.errors.event_name && (
													<div className="invalid-feedback">{this.state.errors.event_name}</div>
												)}
											</div>
										</div>
										<div className="col-md-12">
											<div className="form-group">
												<label className="form-label" htmlFor="event_date">Holiday Date</label>
												<input
													type="date"
													className={`form-control ${this.state.errors.event_date ? "is-invalid" : ""}`}
													name='event_date'
													id='event_date'
													value={selectedHoliday?.event_date || ""}
													onChange={this.handleInputChangeForEditHoliday}
												/>
												{this.state.errors.event_date && (
													<div className="invalid-feedback">{this.state.errors.event_date}</div>
												)}
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
									<button
										type="submit"
										className="btn btn-primary"
									>
										Update Holiday
									</button>
								</div>
							</form>
							)}
						</div>
					</div>
				</div>

				{/* Create modal for delete holiday */}
				<div className="modal fade" id="deleteHolidayModal" tabIndex={-1} role="dialog" aria-labelledby="deleteHolidayModalLabel">
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header" style={{ display: 'none' }}>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
							</div>
							<div className="modal-body">
								<div className="row clearfix">
									<p>Are you sure you want to delete the holiday?</p>
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
	fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Holidays);