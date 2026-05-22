package br.com.vertxmidia.crm.frontend;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FrontendSmokeTest {

    private static final Path STATIC_ROOT = Path.of("src/main/resources/static");
    private static final Pattern LOCAL_ASSET_PATTERN = Pattern.compile("(?:src|href)=\"(/assets/[^\"]+)\"");

    @Test
    void htmlReferencesOnlyExistingLocalAssets() throws IOException {
        for (String page : List.of("app.html", "login.html", "index.html")) {
            String html = Files.readString(STATIC_ROOT.resolve(page), StandardCharsets.UTF_8);
            var matcher = LOCAL_ASSET_PATTERN.matcher(html);

            while (matcher.find()) {
                String assetPath = matcher.group(1).substring(1);
                assertThat(STATIC_ROOT.resolve(assetPath))
                        .as("%s should reference existing asset %s", page, assetPath)
                        .exists();
            }
        }
    }

    @Test
    void appShellLoadsModularPagesBeforeMainOrchestrator() throws IOException {
        String html = Files.readString(STATIC_ROOT.resolve("app.html"), StandardCharsets.UTF_8);

        assertThat(html).contains(
                "/assets/js/pages/dashboard.js",
                "/assets/js/pages/clients.js",
                "/assets/js/pages/kanban.js",
                "/assets/js/pages/executive.js",
                "/assets/js/pages/profile.js",
                "/assets/js/pages/crm.js"
        );
        assertThat(html.indexOf("/assets/js/pages/dashboard.js"))
                .isLessThan(html.indexOf("/assets/js/pages/crm.js"));
        assertThat(html.indexOf("/assets/js/pages/executive.js"))
                .isLessThan(html.indexOf("/assets/js/pages/crm.js"));
        assertThat(html).contains("id=\"mobile-bottom-nav\"");
    }

    @Test
    void browserStorageIsLimitedToAuthVisualPreferencesAndLoginAttemptUi() throws IOException {
        Path assetsRoot = STATIC_ROOT.resolve("assets/js");
        try (var files = Files.walk(assetsRoot)) {
            List<Path> offenders = files
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".js"))
                    .filter(path -> usesBrowserStorageOutsideAllowedPolicy(path, assetsRoot))
                    .toList();

            assertThat(offenders).isEmpty();
        }
    }

    @Test
    void crmCssContainsFinalEnterprisePolishLayer() throws IOException {
        String css = Files.readString(STATIC_ROOT.resolve("assets/styles/crm.css"), StandardCharsets.UTF_8);

        assertThat(css).contains(
                "Final enterprise visual pass",
                "--surface-flat",
                ".mobile-bottom-nav__item.is-active",
                ".empty-state"
        );
    }

    private boolean usesBrowserStorageOutsideAllowedPolicy(Path path, Path assetsRoot) {
        String relative = assetsRoot.relativize(path).toString().replace('\\', '/');
        String content;
        try {
            content = Files.readString(path, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel ler asset frontend " + path, ex);
        }

        if (!content.contains("localStorage") && !content.contains("sessionStorage")) {
            return false;
        }

        if (relative.equals("core/auth.js")) {
            return !(content.contains("vx_auth_token") && content.contains("vx_refresh_token"));
        }

        if (relative.equals("pages/login.js")) {
            return !content.contains("sessionStorage") || !content.contains("vx_login_attempts");
        }

        if (relative.equals("pages/crm.js")) {
            return !content.contains("vx_sidebar_collapsed");
        }

        return true;
    }
}
