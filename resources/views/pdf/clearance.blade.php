<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Zoning Clearance Certificate - {{ $clearance->clearance_no }}</title>
    <style>
        @page {
            margin: 8mm 15mm 8mm 15mm;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.3;
            color: #000000;
        }

        /* Header Styling */
        .header {
            text-align: center;
            margin-bottom: 8px;
            padding: 4px 10px;
        }
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 6px;
        }
        .header h1 {
            margin: 0 0 3px 0;
            font-size: 16px;
            color: #000000;
            font-weight: 700;
            text-transform: uppercase;
        }
        .header-subtitle {
            margin: 0;
            font-size: 11px;
            color: #000000;
            font-weight: normal;
            text-transform: uppercase;
        }
        .certificate-title {
            text-align: center;
            margin: 6px 0;
            font-size: 17px;
            font-weight: 700;
            color: #000000;
            text-transform: uppercase;
            text-decoration: underline;
        }
        .clearance-number {
            text-align: center;
            font-size: 12px;
            color: #000000;
            margin: 3px 0 10px 0;
            font-weight: bold;
        }

        /* Certification Text */
        .certification-text {
            text-align: justify;
            margin: 8px 0;
            font-size: 12px;
            line-height: 1.5;
        }

        /* Section Styling */
        .section {
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #000000;
            text-transform: uppercase;
            margin-bottom: 5px;
            border-bottom: 1.5px solid #000000;
            padding-bottom: 2px;
        }

        /* Info Table Styling */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 5px;
        }
        .info-table td {
            padding: 2px 0;
            font-size: 11px;
            vertical-align: top;
            word-wrap: break-word;
        }
        .info-label {
            width: 40%;
            font-weight: bold;
        }
        .info-value {
            width: 60%;
        }

        /* Conditions Box */
        .conditions-box {
            border: 1px solid #000000;
            padding: 7px;
            font-size: 11px;
            line-height: 1.3;
            margin-top: 3px;
        }

        /* Two-column layout */
        .two-column {
            display: table;
            width: 100%;
            table-layout: fixed;
            margin-bottom: 8px;
        }
        .column {
            display: table-cell;
            width: 50%;
            padding: 0 10px 0 0;
            vertical-align: top;
        }
        .column:last-child {
            padding-right: 0;
            padding-left: 10px;
        }

        /* Signature Section */
        .signature-section {
            margin-top: 10px;
            text-align: right;
            page-break-inside: avoid;
        }
        .signature-line {
            border-top: 1px solid #000000;
            margin: 0 0 4px auto;
            width: 220px;
            display: block;
        }
        .signature-name {
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            text-align: center;
            width: 220px;
            margin-left: auto;
        }
        .signature-label {
            font-size: 11px;
            text-align: center;
            width: 220px;
            margin-left: auto;
        }

        /* Footer */
        .footer {
            margin-top: 12px;
            padding-top: 6px;
            text-align: center;
            font-size: 11px;
            color: #000000;
            border-top: 1px solid #000000;
        }
        .footer p {
            margin: 2px 0;
        }
        
        /* Watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 70px;
            color: rgba(0, 0, 0, 0.05); /* very light black */
            font-weight: bold;
            z-index: -1;
            letter-spacing: 5px;
        }
    </style>
</head>
<body>
    <div class="watermark">NON-OFFICIAL DOCUMENT</div>
    
    <!-- Header -->
    <div class="header">
        <img src="data:image/png;base64,{{ $logo }}" alt="Logo" class="logo">
        <p class="header-subtitle">Republic of the Philippines<br>Local Government Unit</p>
        <h1>URBAN PLANNING &amp; DEVELOPMENT OFFICE</h1>
    </div>

    <div class="certificate-title">ZONING CLEARANCE CERTIFICATE</div>
    <div class="clearance-number">No: {{ $clearance->clearance_no }}</div>

    <!-- Certification Text -->
    <div class="certification-text">
        <strong>TO WHOM IT MAY CONCERN:</strong><br><br>
        This is to certify that the zoning application bearing Reference Number <strong>{{ $application->reference_no }}</strong> has been thoroughly reviewed and evaluated. The proposed development has been found to be in compliance with all applicable zoning regulations, land use policies, and development standards.
    </div>

    <!-- Application Information -->
    <div class="section">
        <div class="section-title">Application Information</div>
        <table class="info-table">
            <tr>
                <td class="info-label" style="width: 25%;">Reference Number:</td>
                <td class="info-value" style="width: 25%;">{{ $application->reference_no }}</td>
                <td class="info-label" style="width: 25%;">Application Date:</td>
                <td class="info-value" style="width: 25%;">{{ $application->application_date ? $application->application_date->format('F d, Y') : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="info-label" style="width: 25%;">Property Owner:</td>
                <td class="info-value" colspan="3">{{ mb_strtoupper($application->lot_owner) }}</td>
            </tr>
        </table>
    </div>

    <!-- Two Column Layout for Property and Project Details -->
    <div class="two-column">
        <!-- Property Details -->
        <div class="column">
            <div class="section">
                <div class="section-title">Property Details</div>
                <table class="info-table">
                    <tr>
                        <td class="info-label">Title / TCT No.:</td>
                        <td class="info-value">{{ $application->tct_no ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Total Lot Area:</td>
                        <td class="info-value">{{ number_format($application->lot_area_total, 2) }} sqm</td>
                    </tr>
                    <tr>
                        <td class="info-label">Address:</td>
                        <td class="info-value">{{ $application->lot_address }}, {{ $application->barangay ?? 'N/A' }}</td>
                    </tr>
                    @if($application->zone)
                    <tr>
                        <td class="info-label">Classification:</td>
                        <td class="info-value">{{ mb_strtoupper($application->zone->name ?? 'N/A') }}</td>
                    </tr>
                    @endif
                </table>
            </div>
        </div>

        <!-- Project Info -->
        <div class="column">
            <div class="section">
                <div class="section-title">Project Details</div>
                <table class="info-table">
                    <tr>
                        <td class="info-label">Nature of Project:</td>
                        <td class="info-value">{{ ucwords(str_replace('_', ' ', $application->project_type ?? 'N/A')) }}</td>
                    </tr>
                    @if($application->building_type)
                    <tr>
                        <td class="info-label">Building/Structure:</td>
                        <td class="info-value">{{ $application->building_type }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="info-label">Proposed Use:</td>
                        <td class="info-value">{{ mb_strtoupper(str_replace('_', ' ', $application->land_use_type ?? 'N/A')) }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Total Floor Area:</td>
                        <td class="info-value">{{ $application->floor_area_sqm ? number_format($application->floor_area_sqm, 2) . ' sqm' : 'N/A' }}</td>
                    </tr>
                    @if($application->number_of_storeys)
                    <tr>
                        <td class="info-label">Storeys:</td>
                        <td class="info-value">{{ $application->number_of_storeys }}</td>
                    </tr>
                    @endif
                </table>
            </div>
        </div>
    </div>

    <!-- Conditions -->
    @if($clearance->conditions)
    <div class="section">
        <div class="section-title">Conditions and Requirements</div>
        <div class="conditions-box">
            {!! nl2br(e($clearance->conditions)) !!}
        </div>
    </div>
    @endif

    <div style="margin-top: 30px; font-size: 13px;">
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%;">
                    <strong>Issued Date:</strong> {{ $clearance->issue_date->format('F d, Y') }}<br><br>
                    <strong>Valid Until:</strong> {{ $clearance->valid_until ? $clearance->valid_until->format('F d, Y') : 'No Expiration' }}
                </td>
                <td style="width: 50%; vertical-align: bottom;">
                    <!-- Signature -->
                    <div class="signature-section">
                        @if($clearance->approvedBy)
                            <div class="signature-name" style="margin-bottom: 5px;">{{ mb_strtoupper($clearance->approvedBy->name) }}</div>
                        @else
                            <div class="signature-name" style="margin-bottom: 5px;">_______________________</div>
                        @endif
                        <div class="signature-line"></div>
                        <div class="signature-label">Zoning Administrator</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This is a computer-generated document and is valid without a physical signature if verified through the official portal.</p>
        <p>Generated on: {{ now()->format('F d, Y h:i A') }}</p>
    </div>
</body>
</html>

