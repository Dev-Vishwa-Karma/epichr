import React, { Component } from 'react'
import { connect } from 'react-redux';
import Fullcalender from '../../common/fullcalender';
class Events extends Component {
	constructor(props) {
		super(props);
		this.state = {
			events: [],
			selectedYear: new Date().getFullYear(),
		}
	}

	componentDidMount() {
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
				});
			} else {
			  	this.setState({ message: data.message });
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data' });
			console.error(err);
		});
	}

	// Handle year selection
	handleYearChange = (event) => {
		this.setState({ selectedYear: Number(event.target.value) });
	};

    render() {
        const { fixNavbar} = this.props;
		const {events, selectedYear } = this.state;

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
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                        <div className="container-fluid">
                            <div className="row clearfix row-deck">
								<div className="col-lg-4 col-md-12">
									<div className="card">
										<div className="card-header bline">
											<h3 className="card-title">Events List</h3>
										</div>
										<div className="card-body">
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
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Events);