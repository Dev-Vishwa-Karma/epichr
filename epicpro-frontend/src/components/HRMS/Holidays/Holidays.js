import React, { Component } from 'react';
import { connect } from 'react-redux';

class Holidays extends Component {
	constructor(props) {
		super(props);
		this.state = {
		  holidays: [],
		  message: null,
		};
	}

	componentDidMount() {
		// Make the GET API call when the component is mounted
		fetch(`${process.env.REACT_APP_API_URL}/get_events.php`)
		// fetch('http://localhost/react/epicpro-backend/get_events.php')
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				const holidaysData = data.data;

				this.setState(
					{ holidays: holidaysData}
				);
			} else {
			  	this.setState({ message: data.message }); // Update messages in state
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data' });
			console.error(err);
		});
	}

	render() {
		const { fixNavbar } = this.props;
		const { holidays, message } = this.state;
		return (
			<>
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
						<div className="container-fluid">
							<div className="row">
								<div className="col-12">
									<div className="card">
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table_custom spacing5 border-style mb-0">
													<thead>
														<tr>
															<th>DAY</th>
															<th>DATE</th>
															<th>HOLIDAY</th>
														</tr>
													</thead>
													<tbody>
														{holidays.length > 0 ? (
															holidays
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
																</tr>
															))
														): (
															!message && <tr><td>Department data not found</td></tr>
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
			</>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Holidays);