import crypto from 'crypto';

/**
 * Verify Plane webhook signature
 * Plane uses HMAC-SHA256 for webhook signatures
 */
export async function verifyPlaneWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  const webhookSecret = process.env['PLANE_WEBHOOK_SECRET'];

  if (!webhookSecret) {
    console.error('PLANE_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    // Generate expected signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}
