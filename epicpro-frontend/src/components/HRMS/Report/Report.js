import React, { Component } from 'react'
import { connect } from 'react-redux';
import CountUp from 'react-countup';
import Modal from 'react-modal';

class Report extends Component {

    constructor(props) {
        super(props);
        this.state = {
            reports: [],
            error: null,
            selectedReport: null,
            isModalOpen: false,
            selectedEmployee: "",
            employeeData: [],
            selectedStatus: "",
            punchOutReport: "",
            activityId: null,
            reportError: null,
            reportSuccess: null,
            addReportByAdminError: null
        };
    }

    componentDidMount() {

        let apiUrl = '';

        //if (window.user.role == 'super_admin' || window.user.role == 'admin') {
        apiUrl = `${process.env.REACT_APP_API_URL}/activities.php`;
        // } else {
        //     apiUrl = `${process.env.REACT_APP_API_URL}/reports.php?user_id=${window.user.id}`;
        // }

        // Make the GET API call when the component is mounted
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.setState({ reports: data.data });
                } else {
                    this.setState({ reports: [], error: data.message });
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

    openModal = (report) => {
        this.setState({ viewPunchOutReportDescription: report.description });
    };

    setActivityIdState = (report) => {
        this.setState({ activityId: report.activity_id });
    };

    deleteReport = () => {
        const { activityId } = this.state;

        // Validate form inputs
        if (!activityId) {
            this.setState({ reportError: 'Invalid Request' });
            setTimeout(() => {
                this.setState({ reportError: null });
            }, 5000)
            return;
        }

        // API call to add break
        fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=delete&id=${activityId}&user_id=${window.user.id}`, {
            method: 'DELETE'
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    this.setState({ reportSuccess: data.message });
                    setTimeout(() => {
                        this.setState({ reportSuccess: null });
                    }, 5000)
                    // Close the modal
                    document.querySelector("#deleteReportModal .close").click();
                    this.componentDidMount();
                } else {
                    this.setState({ reportError: data.message });
                    setTimeout(() => {
                        this.setState({ reportError: null });
                    }, 5000)
                }
            })
            .catch((error) => {
				this.setState({ reportError: 'Something went wrong. Please try again.' });
				setTimeout(() => {
					this.setState({ reportError: null });
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
    handleReportChange = (event) => {
        this.setState({ punchOutReport: event.target.value });
    };

    addReportByAdmin = () => {
        const { selectedEmployee, selectedStatus, punchOutReport } = this.state;

        // Validate form inputs
        if (!selectedEmployee && !selectedStatus) {
            this.setState({ addReportByAdminError: 'Please select an Employee and Status' });
            setTimeout(() => {
                this.setState({ addReportByAdminError: null });
            }, 5000)
            return;
        }

        if (!selectedEmployee) {
            this.setState({ addReportByAdminError: 'Please select an Employee' });
            setTimeout(() => {
                this.setState({ addReportByAdminError: null });
            }, 5000)
            return;
        }

        if (!selectedStatus) {
            this.setState({ addReportByAdminError: 'Please select a Status' });
            setTimeout(() => {
                this.setState({ addReportByAdminError: null });
            }, 5000)
            return;
        }

        if (selectedStatus == 'completed' && !punchOutReport) {
            this.setState({ addReportByAdminError: 'Please provide the punch-out report' });
            setTimeout(() => {
                this.setState({ addReportByAdminError: null });
            }, 5000)
            return;
        }

        const formData = new FormData();
        formData.append('employee_id', selectedEmployee);
		formData.append('activity_type', 'Punch');
		formData.append('description', punchOutReport);
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
                if (data.status === "success") {
                    this.setState({ reportSuccess: data.message });
                    setTimeout(() => {
                        this.setState({ reportSuccess: null });
                    }, 5000)
                    document.querySelector("#addReportModal .close").click();
                    this.componentDidMount();
                } else {
                    this.setState({ addReportByAdminError: data.message });
                    setTimeout(() => {
                        this.setState({ addReportByAdminError: null });
                    }, 5000)
                }
            })
            .catch((error) => {
				this.setState({ addReportByAdminError: 'Something went wrong. Please try again.' });
				setTimeout(() => {
					this.setState({ addReportByAdminError: null });
				}, 5000);
			});
    };

    render() {
        const { fixNavbar } = this.props;
        const { reports, selectedReport, isModalOpen, error, employeeData, selectedStatus, selectedEmployee, punchOutReport, activityId, reportError, reportSuccess, addReportByAdminError } = this.state;
        return (
            <>
                <div>
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
                        <div className="container-fluid">
                            <div className="d-flex justify-content-between align-items-center">
                                <ul className="nav nav-tabs page-header-tab">
                                </ul>
                                {window.user && window.user.role !== 'employee' && (
                                    <div className="header-action d-md-flex">
                                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#addReportModal"><i className="fe fe-plus mr-2" />Add</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="section-body mt-3">
                        <div className="container-fluid">
                            <div className="tab-content mt-3">
                                <div className="tab-pane fade show active" id="Report-Invoices" role="tabpanel">
                                    <div className="card">
                                        {/* Display activity success message outside the modal */}
                                        {reportSuccess && (
                                            <div className="alert alert-success mb-0">{reportSuccess}</div>
                                        )}
                                        {/* Display activity error message outside the modal */}
                                        {reportError && (
                                            <div className="alert alert-danger mb-0">{reportError}</div>
                                        )}
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover table-striped table-vcenter mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Employee Name</th>
                                                            <th>Activity Type</th>
                                                            <th>In Time</th>
                                                            <th>Out Time</th>
                                                            <th>Duration</th>
                                                            <th>Status</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reports.length > 0 ? (
                                                            reports.map((report, index) => (
                                                                <tr>
                                                                    <td>{report.full_name}</td>
                                                                    <td>{report.activity_type}</td>
                                                                    <td>{report.complete_in_time}</td>
                                                                    <td>{report.complete_out_time}</td>
                                                                    <td>{report.duration}</td>
                                                                    <td>
                                                                        {report.status === 'active' && (
                                                                            <label className="badge badge-primary">Active</label>
                                                                        )}
                                                                        {report.status === 'completed' && (
                                                                            <label className="badge badge-success">Completed</label>
                                                                        )}
                                                                        {report.status === 'auto closed' && (
                                                                            <label className="badge badge-warning">Auto Closed</label>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {report.activity_type === 'Punch' && (
                                                                            <button type="button" class="btn btn-icon btn-sm" title="View" data-toggle="modal" data-target="#viewpunchOutReportModal" onClick={() => this.openModal(report)}><i class="icon-eye text-danger"></i></button>
                                                                        )}
                                                                        <button type="button" class="btn btn-icon btn-sm" title="Edit"><i class="icon-pencil text-danger"></i></button>
                                                                        <button type="button" class="btn btn-icon btn-sm" title="Delete" data-toggle="modal" data-target="#deleteReportModal" onClick={() => this.setActivityIdState(report)}><i class="icon-trash text-danger"></i></button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                                                    {error ? error : 'No reports available.'}
                                                                </td>
                                                            </tr>
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
                    {/* Modal for viewing report details */}
                    <div className="modal fade" id="viewpunchOutReportModal" tabIndex={-1} role="dialog" aria-labelledby="viewpunchOutReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="break">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="viewpunchOutReportModal">Punch Out Report</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row clearfix multiline-text">
                                        {this.state.viewPunchOutReportDescription}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Modal for deleting report details */}
                    <div className="modal fade" id="deleteReportModal" tabIndex={-1} role="dialog" aria-labelledby="deleteReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="break">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="deleteReportModal">Delete</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        Are you sure you want to delete this Record?
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={this.deleteReport}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Add Break Modal */}
                    <div className="modal fade" id="addReportModal" tabIndex={-1} role="dialog" aria-labelledby="addReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="report">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="addReportModalLabel">Register Employee Punch-In/Out</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    {/* Display activity error message outside the modal */}
                                    {addReportByAdminError && (
                                            <div className="alert alert-danger mb-0">{addReportByAdminError}</div>
                                        )}
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
                                                    <option value="active">Punch In</option>
                                                    <option value="completed">Punch Out</option>
                                                </select>
                                            </div>
                                        </div>
                                        {selectedStatus === "completed" && (
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <textarea
                                                        className="form-control"
                                                        placeholder="Report"
                                                        value={punchOutReport}
                                                        onChange={this.handleReportChange}
                                                        rows="30"
                                                        cols="50"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={this.addReportByAdmin}>Save changes</button>
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
export default connect(mapStateToProps, mapDispatchToProps)(Report);