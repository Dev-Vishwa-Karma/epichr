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
			event_name: "",
			event_date: "",
			event_type: "",
			errors: {
				event_name: '',
        		event_date: '',
				event_type: '',
			},
			selectedEvent: '',
			deleteHoliday: null,
			successMessage: "",
      		errorMessage: "",
			showSuccess: false,
      		showError: false,
			currentPage: 1,
			dataPerPage: 10,
			loading: true
		};
		// Create a ref to scroll to the message container
		this.messageRef = React.createRef();
	}

	componentDidMount(prevProps, prevState) {
		// Get the logged in user id
		this.setState({
			employee_id: window.user.id,
		});

		// Make the GET API call when the component is mounted
		fetch(`${process.env.REACT_APP_API_URL}/events.php`)
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				const holidaysData = data.data;
				const today = new Date(); // Get today's date

				// Filter only holidays and exclude past holidays
            	const upcomingHolidays = holidaysData.filter(event => event.event_type === 'holiday' && new Date(event.event_date) >= today) 
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date)); // Sort by ASC order

				this.setState(
					{ holidays: upcomingHolidays, loading: false}
				);
			} else {
				this.setState({ message: data.message, loading: false }); // Update messages in state
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
			selectedEvent: null,
			event_name: '',
			event_date: '',
			event_type: '',
			errors: {},
			showAddHolidayModal: true
		});
    };

	closeAddHolidayModal = () => {
        this.setState({
			showAddHolidayModal: false,
			event_name: '',
			event_date: '',
			event_type: '',
			errors: {},
		});
    };

	// Handle input changes for add event/holiday
	handleInputChangeForAddEvent = (event) => {
        const { name, value } = event.target;
        this.setState({
			[name]: value,
			errors: { ...this.state.errors, [name]: "" } // Clear error for this field
		});
    };

	// Validate form inputs
	validateForm = (e) => {
		e.preventDefault();
		
		let errors = { ...this.state.errors }; // Copy errors to avoid direct mutation
    	let isValid = true;

		// Check if we're editing or adding an event
		const eventData = this.state.selectedEvent || this.state;
		const { event_name, event_date, event_type } = eventData;

		// Validate event name (only letters and spaces)
		const namePattern = /^[a-zA-Z\s]+$/;
		if (!event_name) {
			errors.event_name = "Event name is required.";
			isValid = false;
		} else if (!namePattern.test(event_name)) {
		  errors.event_name = 'Event name must only contain letters and spaces.';
		  isValid = false;
		} else {
		  errors.event_name = '';
		}

		// Validate event date
		if (!event_date) {
			errors.event_date = "Event date is required.";
			isValid = false;
		} else {
		  errors.event_date = '';
		}

		// Validate event type (required field)
		if (!event_type) {
			errors.event_type = "Please select an event type.";
			isValid = false;
		} else {
			errors.event_type = '';
		}

		this.setState({ errors });
		return isValid;
	};

	addEvent = (e) => {
		// Prevent default form submission behavior
		e.preventDefault();

		// Reset selectedEvent before adding a new event
		if (this.state.selectedEvent) {
			this.setState({
				selectedEvent: null,
			});
		}

		if (this.validateForm(e)) {
			const { employee_id, event_name, event_date, event_type} = this.state;
			const addEventData = new FormData();
			addEventData.append('employee_id', employee_id);
			addEventData.append('event_name', event_name);
			addEventData.append('event_date', event_date);
			addEventData.append('event_type', event_type);
			console.log('addEventData = ', addEventData);
			// API call to add employee leave
			fetch(`${process.env.REACT_APP_API_URL}/events.php?action=add`, {
				method: "POST",
				body: addEventData,
			})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState((prevState) => {
						const updatedEventData = [...(prevState.holidays || []), data.data];
						
						// Return the updated state
						return {
							holidays: updatedEventData,
							
							// Clear form fields after submission
							event_name: "",
							event_date: "",
							event_type: "",
							showAddHolidayModal: false,
							successMessage: data.message,
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
						errorMessage: "Failed to add event",
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

	// Handle edit event edit button
    handleEditClickForEvent = (holiday) => {
		this.setState({ selectedEvent: holiday });
    };

	handleInputChangeForEditEvent = (event) => {
		const { name, value } = event.target;
		this.setState((prevState) => ({
            selectedEvent: {
                ...prevState.selectedEvent,
                [name]: value, // Dynamically update the field
            },
        }));
	}

	// Update/Edit Event (API Call)
	updateEvent = (e) => {
		e.preventDefault();

		// Validate the form before proceeding
		if (!this.validateForm(e)) {
			return; // If validation fails, don't submit the form
		}

        const { selectedEvent } = this.state;
        if (!selectedEvent) return;

		const updateEventData = new FormData();
        updateEventData.append('employee_id', selectedEvent.employee_id);
		updateEventData.append('event_name', selectedEvent.event_name);
		updateEventData.append('event_date', selectedEvent.event_date);
		updateEventData.append('event_type', selectedEvent.event_type);

        // Example API call
        fetch(`${process.env.REACT_APP_API_URL}/events.php?action=edit&event_id=${selectedEvent.id}`, {
            method: 'POST',
            body: updateEventData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                this.setState((prevState) => {
                    // Update the existing department in the array
                    const updatedEventData = prevState.holidays.map((event) =>
                        event.id === selectedEvent.id ? { ...event, ...data.data } : event
                    );
                
                    return {
                        holidays: updatedEventData,
						successMessage: 'Holiday updated successfully',
						showSuccess: true
                    };
                });

                document.querySelector("#editEventModal .close").click();

				// Scroll to the message section
				this.messageRef.current.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});

				// Auto-hide success message after 3 seconds
				setTimeout(() => {
					this.setState({
						showSuccess: false, 
						successMessage: ''
					});
				}, 3000);
            } else {
				document.querySelector("#editEventModal .close").click();

				this.setState({ 
					errorMessage: "Failed to update event",
					showError: true
				});

				// Scroll to the message section
				this.messageRef.current.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
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
        .catch((error) => console.error('Error updating event:', error));
    };

	// Code for delete holidays
	openDeleteEventModal = (holidayId) => {
        this.setState({
            deleteHoliday: holidayId,
        });
    };

	confirmDelete = () => {
        const { deleteHoliday, currentPage, holidays, dataPerPage } = this.state;
      
        if (!deleteHoliday) return;

		fetch(`${process.env.REACT_APP_API_URL}/events.php?action=delete&event_id=${deleteHoliday}`, {
          	method: 'DELETE'
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

				document.querySelector("#deleteEventModal .close").click();

				// Scroll to the message section
				this.messageRef.current.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});

				setTimeout(() => {
					this.setState({ successMessage: null });
				}, 3000);
			} else {
				this.setState({
					errorMessage: "Failed to delete holiday",
					showError: true
				});

				// Scroll to the message section
				this.messageRef.current.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});

				setTimeout(() => {
					this.setState({ errorMessage: null });
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
		const { holidays, message, showAddHolidayModal, selectedEvent, currentPage, dataPerPage, loading } = this.state;

		// Pagination Logic
        const indexOfLastHoliday = currentPage * dataPerPage;
        const indexOfFirstHoliday = indexOfLastHoliday - dataPerPage;
        const currentHolidays = holidays.slice(indexOfFirstHoliday, indexOfLastHoliday);
		const totalPages = Math.ceil(holidays.length / dataPerPage);
		return (
			<>
				<div>
					{/* Show success and error messages */}
					<div ref={this.messageRef}>
						{this.state.showSuccess && this.state.successMessage && (
							<div className="alert alert-success alert-dismissible fade show" role="alert">
								{this.state.successMessage}
								<button
								type="button"
								className="close"
								aria-label="Close"
								onClick={() => this.handleClose('success')}
								>
								</button>
							</div>
						)}

						{this.state.showError && this.state.errorMessage && (
							<div className="alert alert-danger alert-dismissible fade show" role="alert">
								{this.state.errorMessage}
								<button
								type="button"
								className="close"
								aria-label="Close"
								onClick={() => this.handleClose('error')}
								>
								</button>
							</div>
						)}
					</div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
						<div className="container-fluid">
							<div className="d-flex justify-content-end align-items-center mb-3 mt-3">
								{/* Render the Add buttons and icons */}
								<div className="header-action">
									<button
										onClick={() => this.openAddHolidayModel()}
										type="button"
										className="btn btn-primary"
									>
										<i className="fe fe-plus mr-2" />Add Event
									</button>
								</div>
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
																<th>Action</th>
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
																		<td>
																			<button 
																				type="button"
																				className="btn btn-icon btn-sm"
																				title="Edit"
																				data-toggle="modal"
																				data-target="#editEventModal"
																				onClick={() => this.handleEditClickForEvent(holiday)}
																			>
																				<i className="fa fa-edit" />
																			</button>
																			<button
																				type="button"
																				className="btn btn-icon btn-sm js-sweetalert"
																				title="Delete"
																				data-type="confirm"
																				data-toggle="modal"
																				data-target="#deleteEventModal"
																				onClick={() => this.openDeleteEventModal(holiday.id)}
																			>
																				<i className="fa fa-trash-o text-danger" />
																			</button>
																		</td>
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

				{/* Modal for Add Event */}
				{showAddHolidayModal && (
				<div className="modal fade show d-block" id="addHolidayModal" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Add Event</h5>
								<button type="button" className="close" onClick={this.closeAddHolidayModal}>
									<span>&times;</span>
								</button>
							</div>
							<form onSubmit={this.addEvent}>
							<div className="modal-body">
								<div className="row clearfix">
									<input
										type="hidden"
										className="form-control"
										placeholder="employeeId"
										name='employeeId'
										value={this.state.employee_id}
										onChange={this.handleInputChangeForAddEvent}
									/>
									<div className="col-md-12">
										<div className="form-group">
											<label className="form-label" htmlFor="event_name">Event Name</label>
											<input
												type="text"
												className={`form-control ${this.state.errors.event_name ? "is-invalid" : ""}`}
												name='event_name'
												id='event_name'
												value={this.state.event_name}
												onChange={this.handleInputChangeForAddEvent}
											/>
											{this.state.errors.event_name && (
												<div className="invalid-feedback">{this.state.errors.event_name}</div>
											)}
										</div>
									</div>
									<div className="col-md-6">
										<div className="form-group">
											<label className="form-label" htmlFor="event_date">Event Date</label>
											<input
												type="date"
												className={`form-control ${this.state.errors.event_date ? "is-invalid" : ""}`}
												name='event_date'
												id='event_date'
												value={this.state.event_date}
												onChange={this.handleInputChangeForAddEvent}
											/>
											{this.state.errors.event_date && (
												<div className="invalid-feedback">{this.state.errors.event_date}</div>
											)}
										</div>
									</div>
									<div className="col-sm-6 col-md-6">
										<div className="form-group">
											<label className="form-label" htmlFor="event_type">Event type</label>
											<select 
												name="event_type"
												className={`form-control ${this.state.errors.event_type ? "is-invalid" : ""}`}
												id='event_type'
												onChange={this.handleInputChangeForAddEvent}
												value={this.state.event_type}
											>
												<option value="">Select Event</option>
												<option value="holiday" >Holiday</option>
												<option value="event" >Event</option>
											</select>
											{this.state.errors.event_type && (
												<div className="invalid-feedback">{this.state.errors.event_type}</div>
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
									Add Event
								</button>
							</div>
							</form>
						</div>
					</div>
				</div>
				)}

				{/* Modal for Update/Edit Event/Holiday */}
				<div className="modal fade" id="editEventModal" tabIndex={-1} role="dialog" aria-labelledby="editEventModalLabel">
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Update Event</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
							</div>
							{selectedEvent && (
							<form onSubmit={this.updateEvent}>
								<div className="modal-body">
									<div className="row clearfix">
										<input
											type="hidden"
											className="form-control"
											placeholder="employeeId"
											name='employee_id'
											value={selectedEvent?.employee_id || ""}
											onChange={this.handleInputChangeForEditEvent}
										/>
										<div className="col-md-12">
											<div className="form-group">
												<label className="form-label" htmlFor="event_name">Event Name</label>
												<input
													type="text"
													className={`form-control ${this.state.errors.event_name ? "is-invalid" : ""}`}
													name='event_name'
													id='event_name'
													value={selectedEvent?.event_name || ""}
													onChange={this.handleInputChangeForEditEvent}
												/>
												{this.state.errors.event_name && (
													<div className="invalid-feedback">{this.state.errors.event_name}</div>
												)}
											</div>
										</div>
										<div className="col-md-6">
											<div className="form-group">
												<label className="form-label" htmlFor="event_date">Event Date</label>
												<input
													type="date"
													className={`form-control ${this.state.errors.event_date ? "is-invalid" : ""}`}
													name='event_date'
													id='event_date'
													value={selectedEvent?.event_date || ""}
													onChange={this.handleInputChangeForEditEvent}
												/>
												{this.state.errors.event_date && (
													<div className="invalid-feedback">{this.state.errors.event_date}</div>
												)}
											</div>
										</div>
										<div className="col-sm-6 col-md-6">
											<div className="form-group">
												<label className="form-label" htmlFor="event_type">Event type</label>
												<select 
													name="event_type"
													className={`form-control ${this.state.errors.event_type ? "is-invalid" : ""}`}
													id='event_type'
													onChange={this.handleInputChangeForEditEvent}
													value={selectedEvent?.event_type || ""}
												>
													<option value="">Select Event</option>
													<option value="holiday" >Holiday</option>
													<option value="event" >Event</option>
												</select>
												{this.state.errors.event_type && (
													<div className="invalid-feedback">{this.state.errors.event_type}</div>
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
										Update Event
									</button>
								</div>
							</form>
							)}
						</div>
					</div>
				</div>

				{/* Create modal for delete holiday */}
				<div className="modal fade" id="deleteEventModal" tabIndex={-1} role="dialog" aria-labelledby="deleteEventModalLabel">
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