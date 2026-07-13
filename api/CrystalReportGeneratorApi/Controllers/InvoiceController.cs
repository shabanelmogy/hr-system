using System;
using System.Collections.Generic;
using System.Text;
using System.Web.Http;
using QRCoder;

namespace SaudiEInvoice.Controllers
{
    [RoutePrefix("api/invoice")]
    public class InvoiceController : ApiController
    {
        [HttpPost]
        [Route("generate-qr")]
        public IHttpActionResult GenerateQRCode([FromBody] InvoiceRequest request)
        {
            try
            {
                // التحقق من البيانات
                if (string.IsNullOrWhiteSpace(request.SellerName))
                    return BadRequest("اسم البائع مطلوب");

                if (string.IsNullOrWhiteSpace(request.VatRegistrationNumber))
                    return BadRequest("الرقم الضريبي مطلوب");

                if (string.IsNullOrWhiteSpace(request.InvoiceTimestamp))
                    return BadRequest("تاريخ الفاتورة مطلوب");

                // إنشاء QR Code حسب معايير ZATCA
                string qrCodeData = GenerateZatcaQRCode(
                    request.SellerName,
                    request.VatRegistrationNumber,
                    request.InvoiceTimestamp,
                    request.InvoiceTotal,
                    request.VatTotal
                );

                // توليد صورة QR Code
                QRCodeGenerator qrGenerator = new QRCodeGenerator();
                QRCodeData qrCodeData2 = qrGenerator.CreateQrCode(qrCodeData, QRCodeGenerator.ECCLevel.Q);
                PngByteQRCode qrCode = new PngByteQRCode(qrCodeData2);
                byte[] qrCodeImage = qrCode.GetGraphic(20);

                // إرجاع QR Code كـ Base64
                string base64Image = Convert.ToBase64String(qrCodeImage);

                return Ok(new
                {
                    success = true,
                    qrCodeBase64 = base64Image,
                    qrCodeDataUrl = string.Format("data:image/png;base64,{0}", base64Image),
                    rawData = qrCodeData
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception(string.Format("حدث خطأ: {0}", ex.Message)));
            }
        }

        private string GenerateZatcaQRCode(
            string sellerName,
            string vatNumber,
            string timestamp,
            decimal total,
            decimal vat)
        {
            List<byte> tlvData = new List<byte>();

            // Tag 1: اسم البائع
            AddTLV(tlvData, 1, sellerName);

            // Tag 2: الرقم الضريبي
            AddTLV(tlvData, 2, vatNumber);

            // Tag 3: التاريخ والوقت
            AddTLV(tlvData, 3, timestamp);

            // Tag 4: إجمالي الفاتورة مع الضريبة
            AddTLV(tlvData, 4, total.ToString("0.00"));

            // Tag 5: إجمالي الضريبة
            AddTLV(tlvData, 5, vat.ToString("0.00"));

            return Convert.ToBase64String(tlvData.ToArray());
        }

        private void AddTLV(List<byte> data, byte tag, string value)
        {
            byte[] valueBytes = Encoding.UTF8.GetBytes(value);
            data.Add(tag);
            data.Add((byte)valueBytes.Length);
            data.AddRange(valueBytes);
        }
    }

    public class InvoiceRequest
    {
        public string SellerName { get; set; }
        public string VatRegistrationNumber { get; set; }
        public string InvoiceTimestamp { get; set; }
        public decimal InvoiceTotal { get; set; }
        public decimal VatTotal { get; set; }

        public InvoiceRequest()
        {
            SellerName = string.Empty;
            VatRegistrationNumber = string.Empty;
            InvoiceTimestamp = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
            InvoiceTotal = 0;
            VatTotal = 0;
        }
    }
}