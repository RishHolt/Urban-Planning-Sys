<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Zoning Clearance Certificate - {{ $clearance->clearance_no }}</title>
    <style>
        @page {
            margin: 5mm 6mm 5mm 6mm;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.25;
            color: #1f2937;
        }
        
        /* Header Styling */
        .header {
            text-align: center;
            margin-bottom: 3px;
            padding: 4px 8px;
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            border-radius: 3px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .logo {
            width: 30px;
            height: 30px;
            margin: 0 auto 2px;
            background: white;
            padding: 2px;
            border-radius: 50%;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
        }
        .header h1 {
            margin: 0 0 1px 0;
            font-size: 15px;
            color: #ffffff;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header-subtitle {
            margin: 0;
            font-size: 8.5px;
            color: #e0e7ff;
            font-weight: 400;
        }
        .certificate-title {
            margin: 2px 0 2px;
            padding: 3px 8px;
            font-size: 15px;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: linear-gradient(to bottom, #eff6ff, #dbeafe);
            border-left: 3px solid #2563eb;
            border-right: 3px solid #2563eb;
            border-radius: 2px;
        }
        .clearance-number {
            font-size: 10px;
            color: #4b5563;
            margin: 2px 0;
            padding: 2px 6px;
            background: #f3f4f6;
            border-radius: 2px;
            display: inline-block;
        }
        .clearance-number strong {
            color: #1e3a8a;
        }
        
        /* Certification Text */
        .certification-text {
            text-align: justify;
            margin: 3px 0;
            padding: 4px 8px;
            background: linear-gradient(to right, #eff6ff, #f0f9ff);
            border-left: 3px solid #3b82f6;
            border-radius: 2px;
            font-size: 11px;
            line-height: 1.25;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .certification-text strong {
            color: #1e3a8a;
        }
        
        /* Section Styling */
        .section {
            margin-bottom: 3px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
            margin-bottom: 2px;
            padding: 2px 6px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            border-radius: 2px;
            letter-spacing: 0.3px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        /* Info Table Styling */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            background: #ffffff;
            border-radius: 2px;
            overflow: hidden;
        }
        .info-table tr {
            border-bottom: 1px solid #e5e7eb;
        }
        .info-table tr:last-child {
            border-bottom: none;
        }
        .info-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .info-table td {
            padding: 2px 4px;
            font-size: 11px;
            vertical-align: top;
            word-wrap: break-word;
        }
        .info-label {
            width: 38%;
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            width: 62%;
            color: #1f2937;
        }
        
        /* Conditions Box */
        .conditions-box {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-left: 3px solid #f59e0b;
            border-radius: 2px;
            padding: 4px 6px;
            font-size: 11px;
            line-height: 1.25;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        /* Two-column layout */
        .two-column {
            display: table;
            width: 100%;
            table-layout: fixed;
            margin-bottom: 3px;
        }
        .column {
            display: table-cell;
            width: 50%;
            padding: 0 2px;
            vertical-align: top;
        }
        .column:first-child {
            padding-left: 0;
        }
        .column:last-child {
            padding-right: 0;
        }
        
        /* Signature Section */
        .signature-section {
            margin-top: 3px;
            padding: 4px 6px;
            border: 1px solid #e5e7eb;
            border-radius: 2px;
            background: #f9fafb;
            page-break-inside: avoid;
        }
        .signature-flex {
            display: table;
            width: 100%;
            table-layout: fixed;
        }
        .sig-left {
            display: table-cell;
            width: 70%;
            vertical-align: middle;
            padding-right: 8px;
        }
        .sig-right {
            display: table-cell;
            width: 30%;
            text-align: center;
            vertical-align: middle;
            border-left: 1px solid #e5e7eb;
            padding-left: 8px;
        }
        .signature-line {
            border-top: 1.5px solid #1f2937;
            margin: 0 0 2px 0;
            width: 180px;
            display: inline-block;
        }
        .signature-name {
            font-weight: 700;
            font-size: 11px;
            color: #1f2937;
            text-transform: uppercase;
            margin-bottom: 1px;
        }
        .signature-label {
            font-size: 9px;
            color: #6b7280;
            margin: 0;
        }
        
        /* QR Code */
        .qr-code {
            width: 42px;
            height: 42px;
            margin: 0 auto 2px;
            padding: 3px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 3px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .qr-code img {
            width: 100%;
            height: 100%;
        }
        .qr-text {
            font-size: 7.5px;
            font-weight: 600;
            color: #4b5563;
            margin: 0;
        }
        
        /* Footer */
        .footer {
            margin-top: 3px;
            padding-top: 2px;
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 1px 0;
            line-height: 1.2;
        }
        .footer strong {
            color: #6b7280;
        }
        
        /* Watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(37, 99, 235, 0.04);
            font-weight: 900;
            z-index: -1;
            letter-spacing: 5px;
        }
        
        /* Badge styling */
        .badge {
            display: inline-block;
            padding: 1px 5px;
            font-size: 9px;
            font-weight: 600;
            border-radius: 8px;
            background: #dbeafe;
            color: #1e40af;
        }
    </style>
</head>
<body>
    <div class="watermark">OFFICIAL</div>
    
    <!-- Header -->
    <div class="header">
        <img src="data:image/png;base64,{{ $logo }}" alt="Logo" class="logo">
        <h1>ZONING CLEARANCE SYSTEM</h1>
        <p class="header-subtitle">Urban Planning & Development Office | Republic of the Philippines</p>
    </div>

    <div style="text-align: center;">
        <h2 class="certificate-title">Zoning Clearance Certificate</h2>
        <div class="clearance-number">
            <strong>Certificate No:</strong> {{ $clearance->clearance_no }}
        </div>
    </div>

    <!-- Certification Text -->
    <div class="certification-text">
        <strong>TO WHOM IT MAY CONCERN:</strong> This is to certify that the zoning application bearing Reference Number <strong>{{ $application->reference_no }}</strong> has been thoroughly reviewed and evaluated. The proposed development has been found to be in full compliance with all applicable zoning regulations, land use policies, and development standards as prescribed by law.
    </div>

    <!-- Application Information -->
    <div class="section">
        <div class="section-title">► Application Information</div>
        <table class="info-table">
            <tr>
                <td class="info-label">Reference Number:</td>
                <td class="info-value"><strong>{{ $application->reference_no }}</strong></td>
            </tr>
            <tr>
                <td class="info-label">Application Number:</td>
                <td class="info-value">{{ $application->application_number }}</td>
            </tr>
            <tr>
                <td class="info-label">Application Date:</td>
                <td class="info-value">{{ $application->application_date ? $application->application_date->format('F d, Y') : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="info-label">Property Owner:</td>
                <td class="info-value"><strong>{{ $application->lot_owner }}</strong></td>
            </tr>
        </table>
    </div>

    <!-- Two Column Layout for Property and Project Details -->
    <div class="two-column">
        <!-- Property Details -->
        <div class="column">
            <div class="section">
                <div class="section-title">► Property Details</div>
                <table class="info-table">
                    <tr>
                        <td class="info-label">Address:</td>
                        <td class="info-value">{{ $application->lot_address }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Barangay:</td>
                        <td class="info-value">{{ $application->barangay ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Municipality/City:</td>
                        <td class="info-value">{{ $application->municipality ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Province:</td>
                        <td class="info-value">{{ $application->province ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Lot Area:</td>
                        <td class="info-value"><strong>{{ number_format($application->lot_area_total, 2) }} sqm</strong></td>
                    </tr>
                    @if($application->zone)
                    <tr>
                        <td class="info-label">Zone:</td>
                        <td class="info-value"><span class="badge">{{ $application->zone->name ?? 'N/A' }}</span></td>
                    </tr>
                    @endif
                </table>
            </div>
        </div>

        <!-- Project & Clearance Information -->
        <div class="column">
            <div class="section">
                <div class="section-title">► Project & Clearance Info</div>
                <table class="info-table">
                    <tr>
                        <td class="info-label">Land Use Type:</td>
                        <td class="info-value">{{ ucwords(str_replace('_', ' ', $application->land_use_type ?? 'N/A')) }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Project Type:</td>
                        <td class="info-value">{{ ucwords(str_replace('_', ' ', $application->project_type ?? 'N/A')) }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Issue Date:</td>
                        <td class="info-value"><strong>{{ $clearance->issue_date->format('F d, Y') }}</strong></td>
                    </tr>
                    <tr>
                        <td class="info-label">Valid Until:</td>
                        <td class="info-value">
                            @if($clearance->valid_until)
                                <strong>{{ $clearance->valid_until->format('F d, Y') }}</strong>
                            @else
                                <strong>No Expiration</strong>
                            @endif
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

    <!-- Conditions -->
    @if($clearance->conditions)
    <div class="section">
        <div class="section-title">► Conditions and Requirements</div>
        <div class="conditions-box">
            {!! nl2br(e($clearance->conditions)) !!}
        </div>
    </div>
    @endif

    <!-- Signature Section -->
    <div class="signature-section">
        <div class="signature-flex">
            <div class="sig-left">
                <div class="signature-line"></div>
                @if($clearance->approvedBy)
                    <div class="signature-name">{{ $clearance->approvedBy->name }}</div>
                @else
                    <div class="signature-name">_______________________</div>
                @endif
                <div class="signature-label">Approved by • <strong>Zoning Administrator</strong> • Date: {{ $clearance->issue_date->format('F d, Y') }}</div>
            </div>
            <div class="sig-right">
                <div class="qr-code">
                    <img src="data:image/svg+xml;base64,{{ $qrCode }}" alt="Verification QR Code">
                </div>
                <div class="qr-text">Scan to Verify</div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This is an officially computer-generated zoning clearance certificate and is valid without a physical signature.</p>
        <p><strong>Certificate No:</strong> {{ $clearance->clearance_no }} | <strong>Generated on:</strong> {{ now()->format('F d, Y h:i A') }}</p>
        <p><strong>Important Notice:</strong> Any alteration, tampering, or unauthorized reproduction of this document is unlawful and punishable under applicable laws.</p>
    </div>
</body>
</html>
