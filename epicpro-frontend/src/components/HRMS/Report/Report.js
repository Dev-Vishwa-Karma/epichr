import React, { Component } from 'react'
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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
            addReportByAdminError: null,
            existingFullName: "",
            existingActivityType: "",
            existingActivityDescription: "",
            existingActivityInTime: "",
            existingActivityOutTime: null,
            existingActivitySatus: "",
            existingActivityId: null,
            editReportByAdminError: null,
            employee_id: '',
            report_id: '',
            report: '',
            start_time: '',
			end_time: '',
			todays_working_hours: '',
			break_duration_in_minutes: 0,
			todays_total_hours: '',
			error: {
                report: '',
				start_time: '',
				end_time: '',
                break_duration_in_minutes: ''
			},
            loading: true,
        };
        this.reportMessageTimeout = null;
    }

    componentDidMount() {

        let apiUrl = '';

        if (window.user.role === 'super_admin' || window.user.role === 'admin') {
            apiUrl = `${process.env.REACT_APP_API_URL}/reports.php`;
        } else {
            apiUrl = `${process.env.REACT_APP_API_URL}/reports.php?user_id=${window.user.id}`;
        }

        // Make the GET API call when the component is mounted
        fetch(apiUrl, {
            method: "GET",
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.setState({ reports: data.data, loading: false });
                } else {
                    this.setState({ reports: [], error: data.message, loading: false });
                }
            })
            .catch(err => {
                this.setState({ error: 'Failed to fetch data' });
                console.error(err);
            });

        /** Get employees list */
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php`, {
            method: "GET",
        })
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

        // Check report message from route state
        const { state } = this.props.location;
        if (state?.message) {
            this.setState({ reportSuccess: state.message });

            this.reportMessageTimeout = setTimeout(() => {
                this.setState({ reportSuccess: "" });

                // Clear the message from history to avoid repeating
                this.props.history.replace({ ...this.props.location, state: {} });
            }, 5000);
        }

        // Listen for custom event
        window.addEventListener("reportMessage", this.handleReportMessage);
    }

    componentWillUnmount() {
        window.removeEventListener("reportMessage", this.handleReportMessage);

        // Clear timeout to avoid memory leaks
        if (this.reportMessageTimeout) {
            clearTimeout(this.reportMessageTimeout);
        }
    }

    handleReportMessage = (event) => {
        const { message, report } = event.detail;

        // Clone the report to avoid mutating the original
        const clonedReport = { ...report };

        // Add formatted time fields only if the original fields exist
        if (clonedReport.total_hours) {
            clonedReport.todays_total_hours = clonedReport.total_hours.split(" ")[1];
        }
        if (clonedReport.total_working_hours) {
            clonedReport.todays_working_hours = clonedReport.total_working_hours.split(" ")[1];
        }

        if (report) {
            this.setState(prevState => ({
                reports: [clonedReport, ...prevState.reports],
                reportSuccess: message
            }));
        }

        this.setState({ reportSuccess: message });

        if (message || report) {
            this.reportMessageTimeout = setTimeout(() => {
                this.setState({ reportSuccess: "" });
            }, 3000);
        }
    };

    /* setActivityIdState = (report) => {
        this.setState({ activityId: report.activity_id });
    }; */

    /* setStateForEditReportModel = (report) => {
        this.setState({ existingFullName: report.full_name, existingActivityType: report.activity_type, existingActivityDescription: report.description, existingActivityInTime: report.complete_in_time, existingActivityOutTime: report.complete_out_time, existingActivitySatus: report.status, existingActivityId: report.activity_id });
    }; */

    // Handle textarea input change admin
    handleEditActivityDescriptionChange = (event) => {
        this.setState({ existingActivityDescription: event.target.value });
    };

    // Handle in time input change admin
    handleEditActivityInTimeChange = (event) => {
        this.setState({ existingActivityInTime: event.target.value });
    };

    // Handle in out input change admin
    handleEditActivityOutTimeChange = (event) => {
        this.setState({ existingActivityOutTime: event.target.value });
    };

    // Handle status input change admin
    handleEditActivityStatusChange = (event) => {
        this.setState({ existingActivitySatus: event.target.value });
    };

    editReportByAdmin = () => {
        const { existingActivityDescription, existingActivityInTime, existingActivityOutTime, existingActivitySatus, existingActivityId, existingActivityType } = this.state;

        // Validate form inputs
        if (!existingActivityInTime) {
            this.setState({ editReportByAdminError: 'In-Time is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (!existingActivitySatus) {
            this.setState({ editReportByAdminError: 'Status is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivitySatus === 'active' && existingActivityOutTime) {
            this.setState({ editReportByAdminError: 'Please leave the Out-Time field empty when the status is set to Active!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivitySatus === 'completed' && !existingActivityOutTime) {
            this.setState({ editReportByAdminError: 'Please enter the Out-Time when the status is set to Completed' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivitySatus === 'auto closed' && !existingActivityOutTime) {
            this.setState({ editReportByAdminError: 'Please enter the Out-Time when the status is set to Auto Closed' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivityInTime && existingActivityOutTime) {
            const inTimeDate = new Date(existingActivityInTime);
            const outTimeDate = new Date(existingActivityOutTime);
            if (outTimeDate <= inTimeDate) {
                this.setState({ editReportByAdminError: 'Out-Time must be later than In-Time.' });
                setTimeout(() => {
                    this.setState({ editReportByAdminError: null });
                }, 5000)
                return;
            }
        }
        if (existingActivityType === 'Punch' && existingActivityInTime && existingActivityOutTime && !existingActivityDescription) {
            this.setState({ editReportByAdminError: 'Punch-out Report/Description is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivityType === 'Break' && existingActivityInTime && !existingActivityOutTime && !existingActivityDescription) {
            this.setState({ editReportByAdminError: 'Break Reason/Description is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivityType === 'Break' && existingActivityInTime && existingActivityOutTime && !existingActivityDescription) {
            this.setState({ editReportByAdminError: 'Break Reason/Description is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }

        const formData = new FormData();
        formData.append('activity_id', existingActivityId);
        formData.append('description', existingActivityDescription);
        formData.append('in_time', existingActivityInTime);
        formData.append('out_time', existingActivityOutTime);
        formData.append('status', existingActivitySatus);
        formData.append('updated_by', window.user.id); //updated by admin

        // API call to add break
        fetch(`${process.env.REACT_APP_API_URL}/activities.php?action=edit-report-by-admin`, {
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
                    this.setState({ editReportByAdminError: data.message });
                    setTimeout(() => {
                        this.setState({ editReportByAdminError: null });
                    }, 5000)
                }
            })
            .catch((error) => {
                this.setState({ editReportByAdminError: 'Something went wrong. Please try again.' });
                setTimeout(() => {
                    this.setState({ editReportByAdminError: null });
                }, 5000);
            });

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

        if (selectedStatus === 'completed' && !punchOutReport) {
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

    parseTimeStringToDate = (timeString) => {
        // Handles both "10:30 AM" and "2025-04-21 10:30"
        const ampmMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!ampmMatch) return null;
        let hours = parseInt(ampmMatch[1]);

        const minutes = parseInt(ampmMatch[2]);
        const ampm = ampmMatch[3]?.toUpperCase();

        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    };

    // Format date and time
    formatDateTimeAMPM = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return '';

        // If input is in format "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss"
        if (timeString.includes(' ')) {
            const parts = timeString.split(' ');
            timeString = parts[1]; // Extract the time part
        }

        const [hours, minutes, seconds = '00'] = timeString.split(':');
        const now = new Date();

        now.setHours(parseInt(hours, 10));
        now.setMinutes(parseInt(minutes, 10));
        now.setSeconds(parseInt(seconds, 10));
        now.setMilliseconds(0);

        if (isNaN(now.getTime())) {
            console.warn("Invalid time format:", timeString);
            return '';
        }

        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    getTimeAsDate = (time) => {
        if (!time) return null;
    
        // Handle "2025-04-21 19:30" or just "10:30 AM"
        if (typeof time === 'string') {
            // If it includes date part, extract just the time
            if (time.includes(' ')) {
                const parts = time.split(' ');
                const timePart = parts.length === 2 ? parts[1] : parts[0];
                time = timePart;
            }
    
            // Handle AM/PM
            const ampmMatch = time.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
            if (!ampmMatch) return null;
    
            let hours = parseInt(ampmMatch[1]);
            const minutes = parseInt(ampmMatch[2]);
            const ampm = ampmMatch[3]?.toUpperCase();
    
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
    
            const now = new Date();
            now.setHours(hours);
            now.setMinutes(minutes);
            now.setSeconds(0);
            now.setMilliseconds(0);
    
            return now;
        }
    
        if (time instanceof Date) return time;
    
        return null;
    };    

    openReportModal = (report) => {
        this.setState({ 
            selectedReport: report,
            report: report.report || '',
            start_time: report.start_time ? report.start_time : null,
            break_duration_in_minutes: report.break_duration_in_minutes || 0,
            end_time: report.end_time ? report.end_time : null,
            todays_working_hours: report.todays_working_hours || '',
            todays_total_hours: report.todays_total_hours || '',
            report_id: report.id,
            employee_id: report.employee_id || '',
        });
    };

    closeReportModal = () => {
        this.setState({ selectedReport: null });
    };

    handleChange = (field, value) => {
        const updatedState = {
            [field]: value,
            error: { ...this.state.error, [field]: "" },
        };
    
        const { start_time, end_time, break_duration_in_minutes } = this.state;
    
        // Get raw start and end values
        const rawStart = field === 'start_time' ? value : start_time;
        const rawEnd = field === 'end_time' ? value : end_time;
        const breakMinutes = field === 'break_duration_in_minutes'
            ? parseInt(value || 0, 10)
            : parseInt(break_duration_in_minutes || 0, 10);

        // Parse using consistent utility
        const startDate = this.getTimeAsDate(rawStart);
        const endDate = this.getTimeAsDate(rawEnd);
    
        if (startDate && endDate) {
            const workingDuration = this.calculateWorkingHours(startDate, endDate, breakMinutes);
            const totalDuration = this.calculateWorkingHours(startDate, endDate, 0);
    
            updatedState.todays_working_hours = workingDuration;
            updatedState.todays_total_hours = totalDuration;
        }
    
        this.setState(updatedState);
    };    

    calculateWorkingHours = (start, end, breakMinutes) => {
		try {
            start = this.getTimeAsDate(start);
            end = this.getTimeAsDate(end);

			if (!(start instanceof Date) || isNaN(start)) return "00:00";
			if (!(end instanceof Date) || isNaN(end)) return "00:00";
	
			breakMinutes = parseInt(breakMinutes || 0);
			if (isNaN(breakMinutes)) breakMinutes = 0;
	
			// Remove seconds/milliseconds for cleaner diff
			start.setSeconds(0, 0);
			end.setSeconds(0, 0);
	
			let diff = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
	
			if (diff < 0) diff += 1440;
			diff -= breakMinutes;
			if (diff < 0) diff = 0;
	
			const hours = Math.floor(diff / 60);
			const minutes = Math.round(diff % 60);
	
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		} catch (err) {
			console.error('Error in calculateWorkingHours:', err);
			return "00:00";
		}
	};

    formatToMySQLDateTime = (input) => {
        const pad = (n) => n.toString().padStart(2, '0');
        let date;
    
        if (input instanceof Date && !isNaN(input)) {
            date = input;
        } else if (typeof input === 'string') {
            if (input.includes(' ')) {
                // Handle full datetime string: "2025-04-21 12:00"
                const [, timePart] = input.split(' ');
                const [hours, minutes] = timePart.split(':').map(Number);
                date = new Date();
                date.setHours(hours || 0);
                date.setMinutes(minutes || 0);
                date.setSeconds(0);
                date.setMilliseconds(0);
            } else if (input.includes(':')) {
                // Handle "HH:mm" or "HH:mm:ss"
                const [hours, minutes] = input.split(':').map(Number);
                date = new Date();
                date.setHours(hours || 0);
                date.setMinutes(minutes || 0);
                date.setSeconds(0);
                date.setMilliseconds(0);
            } else {
                return null;
            }
        } else {
            return null;
        }
    
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };    

    validateUpdateReportForm = () => {
		const { report, start_time, end_time, break_duration_in_minutes, todays_total_hours } = this.state;
		let error = {};
		let isValid = true;

		if (!report || report.trim() === "") {
			error.report = "Report is required.";
			isValid = false;
		}

		if (!start_time) {
			error.start_time = "Start time is required.";
			isValid = false;
		}

		if (!end_time) {
			error.end_time = "End time is required.";
			isValid = false;
		}

		if (start_time && end_time) {
            let start = start_time;
            let end = end_time;

            // Convert to Date objects if they are strings (e.g., "18:10:00")
            if (typeof start_time === "string") {
                const [sh, sm, ss] = start_time.split(":");
                start = new Date();
                start.setHours(parseInt(sh), parseInt(sm), parseInt(ss || 0), 0);
            }

            if (typeof end_time === "string") {
                const [eh, em, es] = end_time.split(":");
                end = new Date();
                end.setHours(parseInt(eh), parseInt(em), parseInt(es || 0), 0);
            }

            if (start.getTime() === end.getTime()) {
                error.start_time = "Start and end time cannot be the same.";
                error.end_time = "Start and end time cannot be the same.";
                isValid = false;
            } else if (start > end) {
                error.start_time = "Start time must be before end time.";
                error.end_time = "End time must be after start time.";
                isValid = false;
            }
		}

        // Break duration validation
		if (todays_total_hours) {
			const [hrs, mins] = todays_total_hours.split(":").map(Number);
			const totalMinutes = hrs * 60 + mins;
			const breakMinutes = parseInt(break_duration_in_minutes || 0, 10);

			if (breakMinutes > totalMinutes) {
				error.break_duration_in_minutes = "Break duration cannot exceed the total hours.";
				isValid = false;
			}
		}

		this.setState({ error });
		return isValid;
	};

    updateReport = () => {
        // e.preventDefault();
        if (!this.validateUpdateReportForm()) {
            return;
        }

        const { report_id, report, start_time, break_duration_in_minutes, end_time, todays_working_hours, todays_total_hours, selectedReport } = this.state;
		const formData = new FormData();
        const finalStartTime = start_time || selectedReport.start_time;
        const finalEndTime = end_time || selectedReport.end_time;
        formData.append("report", report);
        formData.append("start_time", this.formatToMySQLDateTime(finalStartTime));
        formData.append("end_time", this.formatToMySQLDateTime(finalEndTime));
        formData.append("break_duration_in_minutes", break_duration_in_minutes);
        formData.append("todays_working_hours", todays_working_hours);
        formData.append("todays_total_hours", todays_total_hours);

		// API call to save the report and punch-out
		fetch(`${process.env.REACT_APP_API_URL}/reports.php?action=update-report-by-user&report_id=${report_id}`, {
			method: "POST",
			body: formData,
		})
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                this.setState({punchSuccess: data.message, isPunchedIn: false, showModal: false, report: '' });
                //window.location.href = '/hr-report';
                this.fetchReports();

                document.querySelector("#editpunchOutReportModal .close").click();
                setTimeout(() => {
                    this.setState({ punchSuccess: null });
                }, 3000);
            } else {
                this.setState({ punchError: data.message });
                //window.location.href = '/hr-report';
                setTimeout(() => {
                    this.setState({ punchError: null });
                }, 3000);
            }
        })
        .catch((error) => {
            this.setState({ punchError: 'Something went wrong. Please try again.' });
            setTimeout(() => {
                this.setState({ punchError: null });
            }, 3000);
        });
	};

    fetchReports = () => {
        fetch(`${process.env.REACT_APP_API_URL}/reports.php?user_id=${window.user.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({ reports: data.data });
            }
        });
    }

    // Get the todays date and based on this update the edit report button
    isToday = (dateString) => {
        const inputDate = new Date(dateString);
        const today = new Date();
    
        return (
            inputDate.getFullYear() === today.getFullYear() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getDate() === today.getDate()
        );
    };    

    render() {
        const { fixNavbar } = this.props;
        const { reports, error, employeeData, selectedStatus, selectedEmployee, punchOutReport, reportError, reportSuccess, addReportByAdminError, existingFullName, existingActivityType, existingActivityDescription, existingActivityInTime, existingActivityOutTime, existingActivitySatus, editReportByAdminError, selectedReport, loading, report, start_time, todays_total_hours, break_duration_in_minutes, todays_working_hours, end_time, punchError, punchSuccess } = this.state;
        return (
            <>
                <div>
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
                        <div className="container-fluid">
                            {/* Display activity success message */}
                            {punchSuccess && (
                                <div className="alert alert-success mb-0">{punchSuccess}</div>
                            )}
                            {/* Display error message */}
                            {punchError && <div className="alert alert-danger mb-0">{punchError}</div>}
                            <div className="d-flex justify-content-between align-items-center">
                                <ul className="nav nav-tabs page-header-tab">
                                </ul>
                                {/* {window.user && window.user.role !== 'employee' && (
                                    <div className="header-action d-md-flex">
                                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#addReportModal"><i className="fe fe-plus mr-2" />Add</button>
                                    </div>
                                )} */}
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
                                            {loading ? (
												<div className="dimmer active p-3">
													<div className="loader" />
												</div>
											) : (
                                                <div className="table-responsive">
                                                    <table className="table table-hover table-striped table-vcenter mb-0">
                                                        <thead>
                                                            <tr>
                                                                {window.user && window.user.role !== 'employee' && (
                                                                    <th>Employee Name</th>
                                                                )}
                                                                <th>Date</th>
                                                                <th>Start Time</th>
                                                                <th>Break Duration</th>
                                                                <th>End Time</th>
                                                                <th>Working Hours</th>
                                                                <th>Total Hours</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reports.length > 0 ? (
                                                                reports.map((report, index) => (
                                                                    <tr key={index}>
                                                                        {window.user && window.user.role !== 'employee' && (
                                                                            <td>{report.full_name}</td>
                                                                        )}
                                                                        <td>
                                                                        {report.created_at && !isNaN(new Date(report.created_at).getTime())
                                                                        ? new Intl.DateTimeFormat('en-US', {
                                                                            day: '2-digit',
                                                                            month: 'short',
                                                                            year: 'numeric',
                                                                        }).format(new Date(report.created_at))
                                                                        : 'N/A'}
                                                                        </td>
                                                                        <td>{this.formatDateTimeAMPM(report.start_time)}</td>
                                                                        <td>{report.break_duration_in_minutes} Mins</td>
                                                                        <td>{this.formatDateTimeAMPM(report.end_time)}</td>
                                                                        <td>{report.todays_working_hours?.slice(0, 5)}</td>
                                                                        <td>{report.todays_total_hours?.slice(0, 5)}</td>
                                                                        <td width="15%">
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn btn-icon btn-sm" 
                                                                                title="View" 
                                                                                data-toggle="modal" 
                                                                                data-target="#viewpunchOutReportModal" 
                                                                                onClick={() => this.openReportModal(report)}
                                                                            >
                                                                                <i className="icon-eye text-danger"></i>
                                                                            </button>

                                                                            {window.user && window.user.role === 'employee' && this.isToday(report.created_at) && (
                                                                                <button 
                                                                                    type="button" 
                                                                                    className="btn btn-icon btn-sm"
                                                                                    title="Edit"
                                                                                    data-toggle="modal" 
                                                                                    data-target= "#editpunchOutReportModal"
                                                                                    onClick={() => this.openReportModal(report)}
                                                                                >
                                                                                    <i className="icon-pencil text-danger"></i>
                                                                                </button>
                                                                            )}
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
                                                        {/* <thead>
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
                                                                        {
                                                                            !(report.activity_type === 'Punch' && !report.complete_out_time) && (
                                                                                <button 
                                                                                    type="button" 
                                                                                    className="btn btn-icon btn-sm" 
                                                                                    title="View" 
                                                                                    data-toggle="modal" 
                                                                                    data-target="#viewpunchOutReportModal" 
                                                                                    onClick={() => this.openModal(report)}
                                                                                >
                                                                                    <i className="icon-eye text-danger"></i>
                                                                                </button>
                                                                            )
                                                                        }
                                                                            <button type="button" class="btn btn-icon btn-sm" title="Edit" data-toggle="modal" data-target="#editReportModal" onClick={() => this.setStateForEditReportModel(report)}><i class="icon-pencil text-danger"></i></button>
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
                                                        </tbody> */}
                                                    </table>
                                                </div>
                                            )}
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
                                    <h5 className="modal-title" id="viewpunchOutReportModal">Report Details</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.closeReportModal}><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    {selectedReport ? (
                                        <div className="row">
                                            {window.user && window.user.role !== 'employee' && (
                                                <div className="col-md-12 mb-3">
                                                    <strong>Employee Name:</strong> {selectedReport.full_name}
                                                </div>
                                            )}
                                            <div className="col-md-12 mb-4">
                                                <strong>Description:</strong>
                                                <div className="multiline-text" >
                                                    {selectedReport.report}
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>Start Time:</strong> {this.formatDateTimeAMPM(selectedReport.start_time)}
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>End Time:</strong> {this.formatDateTimeAMPM(selectedReport.end_time)}
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>Break Duration:</strong> {selectedReport.break_duration_in_minutes} Mins
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>Working Hours:</strong> {selectedReport.todays_working_hours?.slice(0, 5)}
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>Total Hours:</strong> {selectedReport.todays_total_hours?.slice(0, 5)}
                                            </div>
                                        </div>
                                    ) : (
                                        <p>No report data available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Report Modal for employees */}
                    <div className="modal fade" id="editpunchOutReportModal" tabIndex={-1} role="dialog" aria-labelledby="editpunchOutReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="break">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="editpunchoutReportModalLabel">Update Report</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.closeReportModal}><span aria-hidden="true">×</span></button>
                                </div>
                                    {selectedReport && (
                                <div className="dimmer-content">
                                    <div className="modal-body">
                                        {/* Display error message inside the modal */}
                                        {/* {punchErrorModel && <div className="alert alert-danger mb-0">{punchErrorModel}</div>} */}
                                        <div className="row clearfix">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <textarea
                                                        className={`form-control ${this.state.error.report ? "is-invalid" : ""}`}
                                                        name='report'
                                                        placeholder="Please provide the report."
                                                        value={report}
                                                        onChange={(e) => this.handleChange('report', e.target.value)}
                                                        rows="20"
                                                        cols="50"
                                                    />
                                                    {this.state.error.report && (
                                                        <div className="invalid-feedback">{this.state.error.report}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="event_name">Start time</label>
                                                    <DatePicker
                                                        selected={this.getTimeAsDate(start_time)}
                                                        // name="start_time"
                                                        onChange={(time) => this.handleChange('start_time', time)}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Start time"
                                                        dateFormat="h:mm aa"
                                                        placeholderText="Select time"
                                                        className={`form-control ${this.state.error.start_time ? "is-invalid" : ""}`}
                                                    />
                                                    {this.state.error.start_time && (
                                                        <div className="invalid-feedback d-block">{this.state.error.start_time}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="break_duration_in_minutes">Break duration in minutes</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className={`form-control ${this.state.error.break_duration_in_minutes ? "is-invalid" : ""}`}
                                                        name="break_duration_in_minutes"
                                                        id="break_duration_in_minutes"
                                                        placeholder="Add break duration in minutes"
                                                        value={break_duration_in_minutes || 0}
                                                        onChange={(e) => this.handleChange('break_duration_in_minutes', e.target.value)}
                                                    />
                                                    {this.state.error.break_duration_in_minutes && (
                                                        <div className="invalid-feedback">{this.state.error.break_duration_in_minutes}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="event_name">End time</label>
                                                    <DatePicker
                                                        selected={this.getTimeAsDate(end_time)}
                                                        // name="end_time"
                                                        onChange={(time) => this.handleChange('end_time', time)}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="End time"
                                                        dateFormat="h:mm aa"
                                                        placeholderText="Select End time"
                                                        className={`form-control ${this.state.error.end_time ? "is-invalid" : ""}`}
                                                    />
                                                    {this.state.error.end_time && (
                                                        <div className="invalid-feedback d-block">{this.state.error.end_time}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="todays_working_hours">Todays working hours</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="todays_working_hours"
                                                        id="todays_working_hours"
                                                        placeholder="Add break duration in minutes"
                                                        value={todays_working_hours?.slice(0, 5) || ''}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="todays_working_hours">Todays total hours</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="todays_total_hours"
                                                        id="todays_total_hours"
                                                        placeholder="Add break duration in minutes"
                                                        value={todays_total_hours?.slice(0, 5) || ''}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.closeReportModal}>Close</button>
                                        <button type="button" className="btn btn-primary" onClick={this.updateReport}>Update Report</button>
                                    </div>
                                </div>
                                )}
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

                    {/* Modal for edit report details */}
                    <div className="modal fade" id="editReportModal" tabIndex={-1} role="dialog" aria-labelledby="editReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="break">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="editReportModal">Edit Report</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                {/* Display activity error message outside the modal */}
                                {editReportByAdminError && (
                                    <div className="alert alert-danger mb-0">{editReportByAdminError}</div>
                                )}
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Employee</label>
                                                <input type="text" className="form-control" name="example-disabled-input" placeholder="Disabled.." readOnly value={existingFullName} />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Activity Type</label>
                                                <input type="text" className="form-control" name="example-disabled-input" placeholder="Disabled.." value={existingActivityType} readOnly/>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    placeholder="Description"
                                                    value={existingActivityDescription}
                                                    rows="10"
                                                    cols="50"
                                                    onChange={this.handleEditActivityDescriptionChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">In Time</label>
                                                <input type="text" className="form-control" value={existingActivityInTime} onChange={this.handleEditActivityInTimeChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Out Time</label>
                                                <input type="text" className="form-control" value={existingActivityOutTime || ''} onChange={this.handleEditActivityOutTimeChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Status</label>
                                                <select className="form-control" value={existingActivitySatus} onChange={this.handleEditActivityStatusChange}>
                                                    <option value="">Select Status</option>
                                                    <option value="active">Active</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="auto closed">Auto Closed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={this.editReportByAdmin}>Save Changes</button>
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