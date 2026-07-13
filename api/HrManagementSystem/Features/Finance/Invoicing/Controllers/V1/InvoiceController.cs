using Microsoft.AspNetCore.Mvc;
using System.Text;
using QRCoder;

namespace HrManagementSystem.Features.Finance.Invoicing.Controllers.V1
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        /// <summary>
        /// ����� QR Code �������� ����������� ��������
        /// </summary>
        [HttpPost("generate-qr")]
        public IActionResult GenerateQRCode([FromBody] InvoiceRequest request)
        {
            try
            {
                // ������ �� ��������
                if (string.IsNullOrWhiteSpace(request.SellerName))
                    return BadRequest(new { error = "��� ������ �����" });

                if (string.IsNullOrWhiteSpace(request.VatRegistrationNumber))
                    return BadRequest(new { error = "����� ������� �����" });

                if (string.IsNullOrWhiteSpace(request.InvoiceTimestamp))
                    return BadRequest(new { error = "����� �������� �����" });

                // ����� QR Code ��� ������ ZATCA
                string qrCodeData = GenerateZatcaQRCode(
                    request.SellerName,
                    request.VatRegistrationNumber,
                    request.InvoiceTimestamp,
                    request.InvoiceTotal,
                    request.VatTotal
                );

                // ����� ���� QR Code
                using var qrGenerator = new QRCodeGenerator();
                using var qrCodeData2 = qrGenerator.CreateQrCode(qrCodeData, QRCodeGenerator.ECCLevel.Q);
                using var qrCode = new PngByteQRCode(qrCodeData2);
                byte[] qrCodeImage = qrCode.GetGraphic(20);

                // ����� QR Code �� Base64
                string base64Image = Convert.ToBase64String(qrCodeImage);

                return Ok(new
                {
                    success = true,
                    qrCodeBase64 = base64Image,
                    qrCodeDataUrl = $"data:image/png;base64,{base64Image}",
                    rawData = qrCodeData
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"��� ���: {ex.Message}" });
            }
        }

        /// <summary>
        /// ����� QR Code ������� ����� ������
        /// </summary>
        [HttpPost("generate-qr-image")]
        public IActionResult GenerateQRCodeImage([FromBody] InvoiceRequest request)
        {
            try
            {
                // ������ �� ��������
                if (string.IsNullOrWhiteSpace(request.SellerName))
                    return BadRequest("��� ������ �����");

                if (string.IsNullOrWhiteSpace(request.VatRegistrationNumber))
                    return BadRequest("����� ������� �����");

                if (string.IsNullOrWhiteSpace(request.InvoiceTimestamp))
                    return BadRequest("����� �������� �����");

                // ����� QR Code
                string qrCodeData = GenerateZatcaQRCode(
                    request.SellerName,
                    request.VatRegistrationNumber,
                    request.InvoiceTimestamp,
                    request.InvoiceTotal,
                    request.VatTotal
                );

                using var qrGenerator = new QRCodeGenerator();
                using var qrCodeData2 = qrGenerator.CreateQrCode(qrCodeData, QRCodeGenerator.ECCLevel.Q);
                using var qrCode = new PngByteQRCode(qrCodeData2);
                byte[] qrCodeImage = qrCode.GetGraphic(20);

                // ����� ������ ������
                return File(qrCodeImage, "image/png", "invoice-qr.png");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"��� ���: {ex.Message}");
            }
        }

        /// <summary>
        /// ���� ������ QR Code ��� ������ ZATCA
        /// </summary>
        private string GenerateZatcaQRCode(
            string sellerName,
            string vatNumber,
            string timestamp,
            decimal total,
            decimal vat)
        {
            var tlvData = new List<byte>();

            // Tag 1: ��� ������
            AddTLV(tlvData, 1, sellerName);

            // Tag 2: ����� �������
            AddTLV(tlvData, 2, vatNumber);

            // Tag 3: ������� ������
            AddTLV(tlvData, 3, timestamp);

            // Tag 4: ������ �������� �� �������
            AddTLV(tlvData, 4, total.ToString("0.00"));

            // Tag 5: ������ �������
            AddTLV(tlvData, 5, vat.ToString("0.00"));

            return Convert.ToBase64String(tlvData.ToArray());
        }

        /// <summary>
        /// ����� TLV (Tag-Length-Value)
        /// </summary>
        private void AddTLV(List<byte> data, byte tag, string value)
        {
            byte[] valueBytes = Encoding.UTF8.GetBytes(value);
            data.Add(tag);
            data.Add((byte)valueBytes.Length);
            data.AddRange(valueBytes);
        }
    }

    /// <summary>
    /// Model ��������
    /// </summary>
    public class InvoiceRequest
    {
        public string SellerName { get; set; } = string.Empty;
        public string VatRegistrationNumber { get; set; } = string.Empty;
        public string InvoiceTimestamp { get; set; } = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
        public decimal InvoiceTotal { get; set; }
        public decimal VatTotal { get; set; }
    }
}