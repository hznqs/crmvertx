package br.com.vertxmidia.crm.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Security security = new Security();

    public Security getSecurity() {
        return security;
    }

    public static class Security {
        private boolean requireAuth;
        private String allowedOrigins = "";
        private String cspConnectSrc = "";

        public boolean isRequireAuth() {
            return requireAuth;
        }

        public void setRequireAuth(boolean requireAuth) {
            this.requireAuth = requireAuth;
        }

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }

        public List<String> allowedOriginList() {
            return Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(origin -> !origin.isBlank())
                    .filter(origin -> !origin.contains("*"))
                    .toList();
        }

        public List<String> allowedOriginPatternList() {
            return Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(origin -> !origin.isBlank())
                    .filter(origin -> origin.contains("*"))
                    .toList();
        }

        public String getCspConnectSrc() {
            return cspConnectSrc;
        }

        public void setCspConnectSrc(String cspConnectSrc) {
            this.cspConnectSrc = cspConnectSrc;
        }

        public List<String> cspConnectSrcList() {
            return Arrays.stream(cspConnectSrc.split(","))
                    .map(String::trim)
                    .filter(origin -> !origin.isBlank())
                    .toList();
        }
    }
}
