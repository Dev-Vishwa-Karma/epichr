import React, { Component } from 'react'
import { connect } from 'react-redux';
import Fullcalender from '../../common/fullcalender';
class Events extends Component {


    render() {
        const { fixNavbar } = this.props;
        return (
            <>
                <div>
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                        <div className="container-fluid">
                            <div className="row clearfix row-deck">
								<div className="col-lg-4 col-md-12">
									<div className="card">
										<div className="card-body">
											<h3 className="card-title">Events List</h3>
											<div id="event-list" className="fc event_list">
												<div className="fc-event bg-primary" data-class="bg-primary">
													My Event 1
													</div>
												<div className="fc-event bg-info" data-class="bg-info">
													Birthday Party
													</div>
												<div className="fc-event bg-success" data-class="bg-success">
													Meeting
													</div>
												<div className="fc-event bg-warning" data-class="bg-warning">
													Conference
													</div>
												<div className="fc-event bg-danger" data-class="bg-danger">
													My Event 5
													</div>
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
												<a
													href="/#"
													className="card-options-fullscreen"
													data-toggle="card-fullscreen"
												>
													<i className="fe fe-maximize" />
												</a>
											</div>
										</div>
										<div className="card-body">
											{/* <div id="calendar" /> */}
											<Fullcalender></Fullcalender>
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