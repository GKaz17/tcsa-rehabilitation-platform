# RDS certificate bundle

rds-ca.pem contains public Amazon RDS root certificates for eu-north-1. It contains no credentials.

Source: https://truststore.pki.rds.amazonaws.com/eu-north-1/eu-north-1-bundle.pem
AWS guidance: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html
Retrieved: 26 October 2026. Root signatures, CA flags, region subjects and expiry were checked with Node X509Certificate.

The container installs this bundle at /etc/ssl/certs/tcsa-rds.pem and sets DB_SSL_CA to that path. The API retains PDO server-certificate verification and requires a negotiated TLS cipher in production. Update from the official AWS source when AWS rotates root authorities, then rebuild and rerun package and container checks.