import React, { Component } from 'react'
import { connect } from 'react-redux';
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
            punchOutReport: ""
        };
    }

    componentDidMount() {

        let apiUrl = '';

        if (window.user.role === 'super_admin' || window.user.role === 'admin') {
            apiUrl = `${process.env.REACT_APP_API_URL}/reports.php`;
        } else {
            apiUrl = `${process.env.REACT_APP_API_URL}/reports.php?user_id=${window.user.id}`;
        }

        // Make the GET API call when the component is mounted
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.setState({ reports: data.data });
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

    openModal = (report) => {
        this.setState({ selectedReport: report, isModalOpen: true });
    };

    closeModal = () => {
        this.setState({ selectedReport: null, isModalOpen: false });
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

    addReport = () => {
        const { selectedEmployee, selectedStatus, punchOutReport } = this.state;

        // Validate form inputs
        if (!selectedEmployee || !selectedStatus) {
            alert("All the fields are required");
            return;
        }

        const formData = new FormData();
        formData.append('employee_id', selectedEmployee);
        formData.append('punch_status', selectedStatus);
        formData.append('punch_out_report', punchOutReport);

        // API call to add break
        fetch(`${process.env.REACT_APP_API_URL}/reports.php?action=add`, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    alert(data.message);
                    // Close the modal
                    document.querySelector("#addReportModal .close").click();
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
        const { reports, selectedReport, isModalOpen, error, employeeData, selectedStatus, selectedEmployee, punchOutReport } = this.state;
        // Define custom styles for the modal
        const customStyles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
            },
            content: {
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%', // Adjust width as needed
                maxWidth: '600px', // Maximum width
                height: 'auto',
                maxHeight: '80%', // Maximum height
                overflow: 'auto',
                border: '1px solid #ccc',
                background: '#fff',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
            },
        };
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
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover table-striped table-vcenter mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Employee Name</th>
                                                            <th>Employee Code</th>
                                                            <th>Attendance Date</th>
                                                            <th>Punch In</th>
                                                            <th>Punch Out</th>
                                                            <th>Total Hours Worked</th>
                                                            <th>Attendance Status</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reports.length > 0 ? (
                                                            reports.map((report, index) => (
                                                                <tr>
                                                                    <td>{report.employee_name}</td>
                                                                    <td>{report.code}</td>
                                                                    <td>{report.attendance_date}</td>
                                                                    <td>{report.punch_in_time}</td>
                                                                    <td>{report.punch_out_time}</td>
                                                                    <td>{report.total_hours_worked}</td>
                                                                    <td>{report.attendance_status}</td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-primary"
                                                                            onClick={() => this.openModal(report)}
                                                                        >
                                                                            View Report
                                                                        </button>
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
                    {selectedReport && (
                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={this.closeModal}
                            contentLabel="Report Details"
                            ariaHideApp={false}
                            style={customStyles}
                        >
                            <h2>Report Details</h2>
                            {this.state.selectedReport && (
                                <div className="multiline-text">
                                    <p>{this.state.selectedReport.report}</p>
                                    {/* Display other details as needed */}
                                </div>
                            )}
                            <button className="btn btn-secondary" onClick={this.closeModal}>
                                Close
                            </button>
                        </Modal>
                    )}
                    {/* Add Break Modal */}
                    <div className="modal fade" id="addReportModal" tabIndex={-1} role="dialog" aria-labelledby="addReportModalLabel" /* aria-hidden="true" */>
                        <div className="modal-dialog" role="report">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="addReportModalLabel">Add Report</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
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
                                                        rows="10"
                                                        cols="50"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" className="btn btn-primary" onClick={this.addReport}>Save changes</button>
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