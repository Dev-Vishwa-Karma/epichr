import React, { Component } from 'react'
import { connect } from 'react-redux';

class Gallery extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedImages: [],
            images: [],
            filteredImages: [], // Store filtered images
            employee_id: null,
            isModalOpen: false,
            successMessage: '',
            showSuccess: false,
            errorMessage: '',
            showError: false,
            searchQuery: "",
            currentPage: 1,
            imagesPerPage: 8,
            sortOrder: "asc", // Default to newest first
        };
        this.fileInputRef = React.createRef();
    }

    componentDidMount() {
        const {role} = window.user;
        if (window.user?.id) {
            this.setState({
                employee_id: window.user.id,
                sortOrder: "asc",
            });
        }
        // Check if user is admin or superadmin
        if (role === 'admin' || role === 'super_admin') {
            fetch(`${process.env.REACT_APP_API_URL}/gallery.php?action=view`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const sortedImages = this.sortImages(data.data, this.state.sortOrder);
                        this.setState({
                            images: sortedImages,
                            filteredImages: sortedImages,
                        });
                    } else {
                        this.setState({ message: data.message });
                    }
                })
                .catch(err => {
                    this.setState({ message: 'Failed to fetch data' });
                    console.error(err);
                });
        } else {
            // Employees should not see the gallery
            this.setState({ images: [], filteredImages: [], message: 'Access denied' });
        }
    }

    openModal = () => {
        this.setState({
            isModalOpen: true,
        });
    };
    
    closeModal = () => {
        this.setState({
            isModalOpen: false,
            selectedImages: [],
            errorMessage: '',
            showError: false,
        });

        // Reset file input field
        if (this.fileInputRef.current) {
            this.fileInputRef.current.value = "";
        }
    };

    // Remove the selected images from the upload images section
    removeImage = (index) => {
        const updatedImages = [...this.state.selectedImages];
        updatedImages.splice(index, 1);

        this.setState({ selectedImages: updatedImages }, () => {
            // If there are still images, update the file input with remaining images
            if (updatedImages.length > 0) {
                const dataTransfer = new DataTransfer();
                updatedImages.forEach((file) => dataTransfer.items.add(file));
                this.fileInputRef.current.files = dataTransfer.files;
            } else if (this.fileInputRef.current) {
                // Reset the input field when no images are left
                this.fileInputRef.current.value = "";
            }
        });
    };    

    handleImageSelection = (event) => {
        const files = Array.from(event.target.files);

        this.setState({
          selectedImages: files,
        });
    };

    submitImages = () => {
        const { selectedImages, employee_id} = this.state;

        if (selectedImages.length === 0) {
            this.setState({ showError: true, errorMessage: "Please select at least one image before submitting." });
            return;
        }

        const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
        const invalidFiles = selectedImages.filter(file => !validImageTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            this.setState({ showError: true, errorMessage: "Only image files (JPG, PNG, WEBP) are allowed." });
            return;
        }

        if (window.user.role === 'employee') {
            this.setState({ showError: true, errorMessage: "You do not have permission to upload images. Please contact an administrator." });
            return;
        }

        // Prepare FormData to send images via AJAX
        const uploadImageData = new FormData();
        uploadImageData.append('employee_id', employee_id);

        // Ensure only image files are processed
        selectedImages.forEach((image) => {
            if (validImageTypes.includes(image.type)) {
                uploadImageData.append('images[]', image);
            }
        });

        // Send images using fetch or axios
        fetch(`${process.env.REACT_APP_API_URL}/gallery.php?action=add`, {
            method: 'POST',
            body: uploadImageData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // Reset file input field using ref
                if (this.fileInputRef.current) {
                    this.fileInputRef.current.value = "";
                }

                // Clear selected images and show success message
                this.setState(prevState => {
                    const updatedImages = [...prevState.images, ...data.data]; // Append new images
                    const sortedImages = this.sortImages(updatedImages, prevState.sortOrder); // Sort images
                    
                    return {
                        successMessage: data.message,
                        showSuccess: true,
                        selectedImages: [],
                        images: sortedImages,
                        filteredImages: sortedImages // Apply sorting dynamically
                    };
                });
                
                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    this.setState({
                        showSuccess: false,
                        successMessage: '',
                        isModalOpen: false,
                    });
                }, 3000);
            } else {
                this.setState({
                    errorMessage: data.message || "Upload failed. Please try again.",
                    showError: true,
                });

                // Auto-hide error message after 3 seconds
                setTimeout(() => {
                    this.setState({
                        errorMessage: '',
                        showError: false,
                        isModalOpen: false,
                    });
                }, 3000);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            this.setState({
                errorMessage: "An error occurred during the image upload.",
                showError: true,
            });

            // Auto-hide error message after 3 seconds
            setTimeout(() => {
                this.setState({
                    errorMessage: '',
                    showError: false,
                });
            }, 3000);
        });
    };

    // Handle Sort Order Change
    handleSortChange = (event) => {
        const newSortOrder = event.target.value;
        this.setState(prevState => ({
            sortOrder: newSortOrder,
            filteredImages: this.sortImages(prevState.images, newSortOrder)
        }));
    };

    sortImages = (images, sortOrder) => {
        return [...images].sort((a, b) => {
            return sortOrder === "asc"
                ? new Date(b.created_at) - new Date(a.created_at)  // Newest first
                : new Date(a.created_at) - new Date(b.created_at); // Oldest first
        });
    };

    handleSearch = (event) => {
        const query = event.target.value.toLowerCase(); // Get search input
        this.setState({ searchQuery: query }, () => {
            const filtered = this.state.images.filter(image => {
                const fileName = image.url.split('/').pop().toLowerCase();
                return fileName.includes(query);
            });
            this.setState({ filteredImages: filtered });
        });
    };

    // Handle Pagination
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.filteredImages.length / this.state.imagesPerPage);
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };
    
    render() {
        const { fixNavbar } = this.props;
        const { sortOrder, filteredImages, currentPage, imagesPerPage } = this.state;

        // Pagination Logic
        const indexOfLastImage = currentPage * imagesPerPage;
        const indexOfFirstImage = indexOfLastImage - imagesPerPage;
        const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

        const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
        return (
            <>
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                    <div className="container-fluid">
                        <div className="row row-cards">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <div className="page-subtitle ml-0">
                                            {filteredImages.length > 0
                                            ? `${indexOfFirstImage + 1} - ${Math.min(indexOfLastImage, filteredImages.length)} of ${filteredImages.length} photos`
                                            : <span className="text-muted">Image not available</span>}
                                        </div>
                                        <div className="page-options d-flex">
                                            <select className="form-control custom-select w-auto" onChange={this.handleSortChange} value={sortOrder}>
                                                <option value="asc">Newest</option>
                                                <option value="desc">Oldest</option>
                                            </select>
                                            <div className="input-icon ml-2">
                                                <span className="input-icon-addon">
                                                    <i className="fe fe-search" />
                                                </span>
                                                <input type="text" className="form-control" placeholder="Search photo" value={this.state.searchQuery} onChange={this.handleSearch}/>
                                            </div>
                                            <button type="button" className="btn btn-primary ml-2" onClick={this.openModal}>Upload New</button>
                                            {/* Modal For Uploading Images */}
                                            <div
                                                className={`modal fade ${this.state.isModalOpen ? 'show' : ''}`}
                                                id="uploadImageModal"
                                                tabIndex={-1}
                                                role="dialog"
                                                aria-labelledby="uploadImageModalLabel"
                                                aria-hidden={!this.state.isModalOpen}
                                                style={{ display: this.state.isModalOpen ? 'block' : 'none', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                                            >
                                                <div className="modal-dialog" role="document">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title" id="uploadImageModalLabel">
                                                                Upload Images
                                                            </h5>
                                                            <button type="button" className="close" aria-label="Close" onClick={this.closeModal}>
                                                                <span aria-hidden="true">&times;</span>
                                                            </button>
                                                        </div>
                                                        <div className="modal-body">
                                                            {/* Success and Error Messages */}
                                                            {this.state.showSuccess && (
                                                                <div className="alert alert-success">{this.state.successMessage}</div>
                                                            )}

                                                            {/* File Input */}
                                                            <input
                                                                type="file"
                                                                onChange={this.handleImageSelection}
                                                                className="form-control"
                                                                multiple
                                                                ref={this.fileInputRef}
                                                            />
                                                            {/* Show error message if an invalid file is selected */}
                                                            {this.state.showError && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>{this.state.errorMessage}</div>
                                                            )}

                                                            {/* Preview Section */}
                                                            {this.state.selectedImages.length > 0 && (
                                                                <div className="mt-3">
                                                                    <p>Selected Images:</p>
                                                                    <div className="d-flex flex-wrap">
                                                                        {this.state.selectedImages.map((image, index) => (
                                                                            <div key={index} className="position-relative m-2">
                                                                                <img
                                                                                    src={URL.createObjectURL(image)}
                                                                                    alt="Preview"
                                                                                    className="img-thumbnail"
                                                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                                                />
                                                                                <button
                                                                                    className="btn btn-danger btn-sm position-absolute"
                                                                                    style={{ top: '-5px', right: '-5px', borderRadius: '50%' }}
                                                                                    onClick={() => this.removeImage(index)}
                                                                                >
                                                                                    &times;
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-secondary" onClick={this.closeModal}>
                                                                Cancel
                                                            </button>
                                                            <button type="button" className="btn btn-primary" onClick={this.submitImages}>
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Images listing */}
                        <div className="row row-cards">
                            {window.user?.role === "employee" ? ( // Check if logged-in user is an employee
                                <div className="col-12">
                                    <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                        <span className="text-danger fw-bold">Access Denied</span>
                                    </div>
                                </div>
                            ) : filteredImages.length > 0 ? ( // If not employee, show images if available
                                currentImages.map((image, index) => (
                                    <div className="col-sm-6 col-lg-3" key={index + 1}>
                                        <div className="card p-3">
                                            <img src={`${process.env.REACT_APP_API_URL}/${image.url}`} alt="Gallery" className="rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12">
                                    <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                        <span>Image not available</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Only show pagination if there are images */}
                        {filteredImages.length > 0 && totalPages > 1 && (
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
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Gallery);