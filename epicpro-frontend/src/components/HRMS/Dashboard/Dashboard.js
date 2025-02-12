import React, { Component } from 'react';
import Columnchart from '../../common/columnchart';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
		  totalUsers: 0,
		  totalEvents: 0,
		  totalHolidays: 0,
		};
	}

	componentDidMount() {
		// Make the GET API call when the component is mounted
		// fetch('https://cors-anywhere.herokuapp.com/https://abundantpractices.com/hr/get_events.php')
		fetch(`${process.env.REACT_APP_API_URL}/dashboard.php`)
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				const totalUsers = data.data[0].total_users;
				const totalHolidays = data.data[0].total_holidays;
				const totalEvents = data.data[0].total_events;
				this.setState(
					{ totalUsers: totalUsers, totalHolidays: totalHolidays, totalEvents: totalEvents}
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
		const { totalUsers, totalHolidays, totalEvents } = this.state;
		return (
			<>
				<div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
						<div className="container-fluid">
							<div className="row clearfix">
								<div className="col-lg-12">
									<div className={`section-body ${fixNavbar ? "mb-4 mt-3" : "mb-4"}`}>
										<h4>Welcome Jason Porter!</h4>
										<small>
											Measure How Fast You’re Growing Monthly Recurring Revenue.{' '}
											<a href="fake_url">Learn More</a>
										</small>
									</div>
								</div>
							</div>
							<div className="row clearfix justify-content-start">
								<div className="col-6 col-md-4 col-xl-2">
									<div className="card">
										<div className="card-body ribbon">
											<div className="ribbon-box green">{totalUsers}</div>
											<Link to="/hr-users" className="my_sort_cut text-muted">
												<i className="icon-users" />
												<span>Users</span>
											</Link>
										</div>
									</div>
								</div>
								<div className="col-6 col-md-4 col-xl-2">
									<div className="card">
										<div className="card-body ribbon">
										<div className="ribbon-box info">{totalHolidays}</div>
											<Link to="/hr-holidays" className="my_sort_cut text-muted">
												<i className="icon-like" />
												<span>Holidays</span>
											</Link>
										</div>
									</div>
								</div>
								<div className="col-6 col-md-4 col-xl-2">
									<div className="card">
										<div className="card-body ribbon">
											<div className="ribbon-box orange">{totalEvents}</div>
											<Link to="/hr-events" className="my_sort_cut text-muted">
												<i className="icon-calendar" />
												<span>Events</span>
											</Link>
										</div>
									</div>
								</div>
								<div className="col-6 col-md-4 col-xl-2">
									<div className="card">
										<div className="card-body">
											<Link to="/hr-payroll" className="my_sort_cut text-muted">
												<i className="icon-credit-card" />
												<span>Payroll</span>
											</Link>
										</div>
									</div>
								</div>
								<div className="col-6 col-md-4 col-xl-2">
									<div className="card">
										<div className="card-body">
											<Link to="/hr-accounts" className="my_sort_cut text-muted">
												<i className="icon-calculator" />
												<span>Accounts</span>
											</Link>
										</div>
									</div>
								</div>
								<div className="col-6 col-md-4 col-xl-2">
									<div className="card">
										<div className="card-body">
											<Link to="/hr-report" className="my_sort_cut text-muted">
												<i className="icon-pie-chart" />
												<span>Report</span>
											</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="section-body">
						<div className="container-fluid">
							<div className="row clearfix row-deck">
								<div className="col-xl-12 col-lg-12 col-md-12">
									<div className="card">
										<div className="card-header">
											<h3 className="card-title">Employee Structure</h3>
										</div>
										<div className="card-body text-center">
											<Columnchart></Columnchart>

										</div>

										{/* <div className="card-body text-center">
												<div className="row clearfix">
													<div className="col-6">
														<h6 className="mb-0">50</h6>
														<small className="text-muted">Male</small>
													</div>
													<div className="col-6">
														<h6 className="mb-0">17</h6>
														<small className="text-muted">Female</small>
													</div>
												</div>
											</div> */}
									</div>
								</div>
							</div>
							<div className="row clearfix">
								<div className="col-12 col-sm-12">
									<div className="card">
										<div className="card-header">
											<h3 className="card-title">Project Summary</h3>
										</div>
										<div className="card-body">
											<div className="table-responsive">
												<table className="table table-hover table-striped text-nowrap table-vcenter mb-0">
													<thead>
														<tr>
															<th>#</th>
															<th>Client Name</th>
															<th>Team</th>
															<th>Project</th>
															<th>Project Cost</th>
															<th>Payment</th>
															<th>Status</th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<td>#AD1245</td>
															<td>Sean Black</td>
															<td>
																<ul className="list-unstyled team-info sm margin-0 w150">
																	<li>
																		<img
																			src="/assets/images/xs/avatar1.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar2.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar3.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar4.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li className="ml-2">
																		<span>2+</span>
																	</li>
																</ul>
															</td>
															<td>Angular Admin</td>
															<td>$14,500</td>
															<td>Done</td>
															<td>
																<span className="tag tag-success">Delivered</span>
															</td>
														</tr>
														<tr>
															<td>#DF1937</td>
															<td>Sean Black</td>
															<td>
																<ul className="list-unstyled team-info sm margin-0 w150">
																	<li>
																		<img
																			src="/assets/images/xs/avatar1.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar2.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar3.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar4.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li className="ml-2">
																		<span>2+</span>
																	</li>
																</ul>
															</td>
															<td>Angular Admin</td>
															<td>$14,500</td>
															<td>Pending</td>
															<td>
																<span className="tag tag-success">Delivered</span>
															</td>
														</tr>
														<tr>
															<td>#YU8585</td>
															<td>Merri Diamond</td>
															<td>
																<ul className="list-unstyled team-info sm margin-0 w150">
																	<li>
																		<img
																			src="/assets/images/xs/avatar1.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar2.jpg"
																			alt="Avatar"
																		/>
																	</li>
																</ul>
															</td>
															<td>One page html Admin</td>
															<td>$500</td>
															<td>Done</td>
															<td>
																<span className="tag tag-orange">Submit</span>
															</td>
														</tr>
														<tr>
															<td>#AD1245</td>
															<td>Sean Black</td>
															<td>
																<ul className="list-unstyled team-info sm margin-0 w150">
																	<li>
																		<img
																			src="/assets/images/xs/avatar1.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar2.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar3.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar4.jpg"
																			alt="Avatar"
																		/>
																	</li>
																</ul>
															</td>
															<td>Wordpress One page</td>
															<td>$1,500</td>
															<td>Done</td>
															<td>
																<span className="tag tag-success">Delivered</span>
															</td>
														</tr>
														<tr>
															<td>#GH8596</td>
															<td>Allen Collins</td>
															<td>
																<ul className="list-unstyled team-info sm margin-0 w150">
																	<li>
																		<img
																			src="/assets/images/xs/avatar1.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar2.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar3.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li>
																		<img
																			src="/assets/images/xs/avatar4.jpg"
																			alt="Avatar"
																		/>
																	</li>
																	<li className="ml-2">
																		<span>2+</span>
																	</li>
																</ul>
															</td>
															<td>VueJs Application</td>
															<td>$9,500</td>
															<td>Done</td>
															<td>
																<span className="tag tag-success">Delivered</span>
															</td>
														</tr>
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
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);