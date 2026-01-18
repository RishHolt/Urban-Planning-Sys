import Swal from 'sweetalert2';

export interface SwalOptions {
    title?: string;
    text?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmButtonColor?: string;
    cancelButtonColor?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
    timer?: number;
    timerProgressBar?: boolean;
}

/**
 * Show a success alert
 */
export const showSuccess = async (text: string, title: string = 'Success!'): Promise<void> => {
    await Swal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
    });
};

/**
 * Show an error alert
 */
export const showError = async (text: string, title: string = 'Error'): Promise<void> => {
    await Swal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonColor: '#ef4444',
    });
};

/**
 * Show a warning alert
 */
export const showWarning = async (text: string, title: string = 'Warning'): Promise<void> => {
    await Swal.fire({
        title,
        text,
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
    });
};

/**
 * Show a confirmation dialog
 */
export const showConfirm = async (
    text: string,
    title: string = 'Are you sure?',
    confirmText: string = 'Yes',
    cancelText: string = 'Cancel',
    confirmColor: string = '#10b981',
    icon: 'question' | 'warning' = 'question'
): Promise<boolean> => {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: '#6b7280',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
    });
    return result.isConfirmed;
};

/**
 * Show a custom alert with full control
 */
export const showAlert = async (options: SwalOptions): Promise<boolean> => {
    const result = await Swal.fire({
        ...options,
        confirmButtonColor: options.confirmButtonColor || '#10b981',
        cancelButtonColor: options.cancelButtonColor || '#6b7280',
    });
    return result.isConfirmed;
};

/**
 * Show success for document approval
 */
export const showDocumentApproved = async (): Promise<void> => {
    await showSuccess('Document has been approved successfully.');
};

/**
 * Show success for document rejection
 */
export const showDocumentRejected = async (): Promise<void> => {
    await Swal.fire({
        title: 'Document Rejected',
        text: 'Document has been rejected successfully.',
        icon: 'success',
        confirmButtonColor: '#ef4444',
        timer: 2000,
        timerProgressBar: true,
    });
};

/**
 * Show success for status update
 */
export const showStatusUpdated = async (): Promise<void> => {
    await showSuccess('Application status has been updated successfully.');
};

/**
 * Show confirmation for document approval
 */
export const confirmDocumentApproval = async (): Promise<boolean> => {
    return await showConfirm(
        'Are you sure you want to approve this document?',
        'Are you sure?',
        'Yes, approve it!',
        'Cancel',
        '#10b981',
        'question'
    );
};

/**
 * Show confirmation for document rejection
 */
export const confirmDocumentRejection = async (): Promise<boolean> => {
    return await showConfirm(
        'Are you sure you want to reject this document?',
        'Are you sure?',
        'Yes, reject it!',
        'Cancel',
        '#ef4444',
        'warning'
    );
};

/**
 * Show warning for missing notes
 */
export const showNotesRequired = async (): Promise<void> => {
    await Swal.fire({
        title: 'Notes Required',
        text: 'Please provide a reason for rejecting this document.',
        icon: 'warning',
        confirmButtonColor: '#ef4444',
    });
};

/**
 * Show success for document upload
 */
export const showDocumentUploaded = async (message: string = 'Document has been uploaded successfully.'): Promise<void> => {
    await showSuccess(message, 'Document Uploaded');
};

/**
 * Show success for document replacement
 */
export const showDocumentReplaced = async (message: string = 'Document has been replaced successfully. The new version is pending review.'): Promise<void> => {
    await showSuccess(message, 'Document Replaced');
};
