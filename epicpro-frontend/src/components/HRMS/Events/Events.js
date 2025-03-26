import React, { Component } from 'react'
import { connect } from 'react-redux';
import Fullcalender from '../../common/fullcalender';
class Events extends Component {
	constructor(props) {
		super(props);
		this.state = {
			events: [],
			selectedYear: new Date().getFullYear(),
			showAddEventModal: false,
			employee_id: null,
			event_name: "",
			event_date: "",
			errors: {
				event_name: '',
        		event_date: '',
			},
			selectedEvent: '',
			successMessage: "",
      		errorMessage: "",
			showSuccess: false,
      		showError: false,
			loading: true
		}
	}

	componentDidMount() {
		// Get the logged in user id
		this.setState({
			employee_id: window.user.id,
		});

		// Make the GET API call when the component is mounted
		fetch(`${process.env.REACT_APP_API_URL}/events.php`, {
			method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
		})
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				const eventsData = data.data;
				this.setState({
					events: eventsData,
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
	}

	// Handle year selection
	handleYearChange = (event) => {
		this.setState({ selectedYear: Number(event.target.value) });
	};

	handleClose = (messageType) => {
		if (messageType === 'success') {
		  this.setState({ showSuccess: false, successMessage: '' });
		} else if (messageType === 'error') {
		  this.setState({ showError: false, errorMessage: '' });
		}
	};

	// Function for "Add" button based on active tab
    openAddEventModel = () => {
		this.setState({
			selectedEvent: null,
			event_name: '',
			event_date: '',
			errors: {},
			showAddEventModal: true
		});
    };

	closeAddEventModal = () => {
        this.setState({
			showAddEventModal: false,
			event_name: '',
			event_date: '',
			errors: {},
		});
    };

	// Handle input changes for add event
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
		const { event_name, event_date } = eventData;

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
			const { employee_id, event_name, event_date} = this.state;
			const addEventData = new FormData();
			addEventData.append('employee_id', employee_id);
			addEventData.append('event_name', event_name);
			addEventData.append('event_date', event_date);
			addEventData.append('event_type', 'event');
			// API call to add employee leave
			fetch(`${process.env.REACT_APP_API_URL}/events.php?action=add`, {
				method: "POST",
				headers: {
					"ngrok-skip-browser-warning": "true"
				},
				body: addEventData,
			})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					this.setState((prevState) => {
						const updatedEventData = [...(prevState.events || []), data.data];
						
						// Return the updated state
						return {
							events: updatedEventData,
							
							// Clear form fields after submission
							event_name: "",
							event_date: "",
							showAddEventModal: false,
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

    render() {
        const { fixNavbar} = this.props;
		const {events, selectedYear, showAddEventModal, loading  } = this.state;

		// Dynamic generation of years (last 50 years to next 10 years)
		const currentDate = new Date();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const defaultDate = `${selectedYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const startYear = currentYear - 50;
        const endYear = currentYear + 10;

        // Generate an array of years
    	const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

		const filteredEvents = events
		.map((event) => {
			let eventDate = new Date(event.event_date);
			let eventYear = eventDate.getFullYear();

			// Only update the year if event_type is "event" and the event is from a previous year
			if (event.event_type === "event" && eventYear < selectedYear) {
				eventDate.setFullYear(selectedYear);
			}

			return {
				...event,
				event_date: eventDate.toISOString().split("T")[0], // Convert back to YYYY-MM-DD format
			};
		})
		.filter((event) => {
			const eventDate = new Date(event.event_date);
    		const eventYear = eventDate.getFullYear();

    		// Show only events from the selected year AND from today onwards
    		return eventYear === selectedYear && eventDate >= currentDate;
		})
		.sort((a, b) => new Date(a.event_date) - new Date(b.event_date)); // Sort events by date

		// Format filtered events, ensuring 'event' type events show up for all years
        const formattedEvents = filteredEvents.map(event => {
            if (event.event_type === 'event') {
				// For event type (like birthdays), we need to create an event for each year
				const eventDate = new Date(event.event_date);
				const formattedEventForAllYears = [];
		 
				// Generate the event for each year in the selected range (or all years you want)
				for (let year = startYear; year <= endYear; year++) {
					const newEventDate = new Date(eventDate);
					newEventDate.setFullYear(year);
					formattedEventForAllYears.push({
						title: event.event_name,
						start: newEventDate.toISOString().split('T')[0],
					});
				}
				return formattedEventForAllYears;
            }

            // For other types, just use the filtered events
            return {
                title: event.event_name,
                start: event.event_date,
            };
        }).flat();

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
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                        <div className="container-fluid">
                            <div className="row clearfix row-deck">
								<div className="col-lg-4 col-md-12">
									<div className="card">
										<div className="card-header bline d-flex justify-content-between align-items-center">
											<h3 className="card-title">Events List</h3>
											{/* Render the Add buttons and icons */}
											<div className="header-action">
												<button
													onClick={() => this.openAddEventModel()}
													type="button"
													className="btn btn-primary"
												>
													<i className="fe fe-plus mr-2" />Add Event
												</button>
											</div>
										</div>
										<div className="card-body">
											{loading ? (
												<div className="dimmer active mb-4 p-3 px-3">
													<div className="loader" />
												</div>
											) : (
												<div id="event-list" className="fc event_list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
													{filteredEvents.length > 0 ? (
														filteredEvents.map((event, index) => (
															<div key={index} className="event-item">
																<div
																	data-class={
																		event.event_type === 'holiday'
																			? 'bg-danger'
																			: event.event_type === 'event'
																			? 'bg-info'
																			: 'bg-primary'
																	}
																	className= {
																		`fc-event ${
																		event.event_type === 'holiday'
																			? 'holiday-event'
																			: event.event_type === 'event'
																			? 'regular-event'
																			: 'other-event'
																	}`
																}>
																	<strong className="d-block">{event.event_name}</strong>
																	<small>
																		{event.event_date 
																			? new Date(event.event_date).toLocaleDateString('en-US', { 
																				year: 'numeric', 
																				month: 'short', 
																				day: 'numeric' 
																			}) 
																			: 'No Date'}
																	</small>
																</div>
															</div>
														))
													): (
														<div className="fc-event bg-info" data-class="bg-info">No events found for this year.</div>
													)}
												</div>
											)}
											<div className="todo_list mt-4">
												<h3 className="card-title">
													ToDo List <small>This Month task list</small>
												</h3>
												<ul className="list-unstyled mb-0">
													<li>
														<label className="custom-control custom-checkbox">
															<input
																type="checkbox"
																className="custom-control-input"
																name="example-checkbox1"
																defaultValue="option1"
																defaultChecked
															/>
															<span className="custom-control-label">
																Report Panel Usag
																</span>
														</label>
													</li>
													<li>
														<label className="custom-control custom-checkbox">
															<input
																type="checkbox"
																className="custom-control-input"
																name="example-checkbox1"
																defaultValue="option1"
															/>
															<span className="custom-control-label">
																Report Panel Usag
																</span>
														</label>
													</li>
													<li>
														<label className="custom-control custom-checkbox">
															<input
																type="checkbox"
																className="custom-control-input"
																name="example-checkbox1"
																defaultValue="option1"
																defaultChecked
															/>
															<span className="custom-control-label">
																New logo design for Angular Admin
																</span>
														</label>
													</li>
													<li>
														<label className="custom-control custom-checkbox">
															<input
																type="checkbox"
																className="custom-control-input"
																name="example-checkbox1"
																defaultValue="option1"
															/>
															<span className="custom-control-label">
																Design PSD files for Angular Admin
																</span>
														</label>
													</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
								<div className="col-lg-8 col-md-12">
									<div className="card">
										<div className="card-header bline">
											<h3 className="card-title">Sara Hopkins</h3>
											<div className="card-options">
												<label htmlFor="year-selector" className='d-flex card-title mr-3 align-items-center'>Year: </label>
												<select
													id="year-selector"
													className='w-70 custom-select'
													value={selectedYear}
													onChange={this.handleYearChange}
												>
													{years.map(year => (
														<option key={year} value={year}>
															{year}
														</option>
													))}
												</select>
											</div>
										</div>
										<div className="card-body">
											{/* Pass the formatted events to the FullCalendar component */}
											<Fullcalender events={formattedEvents} defaultDate={defaultDate}></Fullcalender>
										</div>
									</div>
								</div>
							</div>
                        </div>
                    </div>
                </div>

				{/* Modal for Add Event */}
				{showAddEventModal && (
				<div className="modal fade show d-block" id="addEventModal" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Add Event</h5>
								<button type="button" className="close" onClick={this.closeAddEventModal}>
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
										<div className="col-md-12">
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
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" onClick={this.closeAddEventModal}>
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
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Events);