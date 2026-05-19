#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <sys/stat.h>
#include <fcntl.h>
#define PORT 3000
#define BUFSIZE 8192
#define ROOT "/home/z/my-project/.next/standalone"
#define DL "/home/z/my-project/download"
const char *mime(const char *ext) {
    if (!strcmp(ext, ".html")) return "text/html;charset=utf-8";
    if (!strcmp(ext, ".js")) return "application/javascript";
    if (!strcmp(ext, ".css")) return "text/css";
    if (!strcmp(ext, ".json")) return "application/json";
    if (!strcmp(ext, ".svg")) return "image/svg+xml";
    if (!strcmp(ext, ".woff2")) return "font/woff2";
    if (!strcmp(ext, ".png")) return "image/png";
    if (!strcmp(ext, ".ico")) return "image/x-icon";
    return "application/octet-stream";
}
char *find_file(const char *url, char *buf, int buflen) {
    if (!strcmp(url, "/")) { snprintf(buf, buflen, "%s/index.html", DL); if (!access(buf, R_OK)) return buf; }
    if (!strncmp(url, "/_next/", 7)) { snprintf(buf, buflen, "%s/.next/%s", ROOT, url + 7); if (!access(buf, R_OK)) return buf; }
    snprintf(buf, buflen, "%s/public%s", ROOT, url); if (!access(buf, R_OK)) return buf;
    snprintf(buf, buflen, "%s%s", DL, url); if (!access(buf, R_OK)) return buf;
    if (strncmp(url, "/_next", 6) && !strchr(url+1, '.')) { snprintf(buf, buflen, "%s/index.html", DL); if (!access(buf, R_OK)) return buf; }
    return NULL;
}
int main() {
    int s = socket(AF_INET, SOCK_STREAM, 0); int opt = 1;
    setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    struct sockaddr_in addr = { .sin_family = AF_INET, .sin_port = htons(PORT), .sin_addr.s_addr = INADDR_ANY };
    if (bind(s, (struct sockaddr*)&addr, sizeof(addr)) < 0) { perror("bind"); return 1; }
    listen(s, 128); printf("HealthFlow C server on port %d\n", PORT); fflush(stdout);
    while (1) {
        int c = accept(s, NULL, NULL); if (c < 0) continue;
        char req[BUFSIZE]; int n = read(c, req, BUFSIZE-1);
        if (n <= 0) { close(c); continue; } req[n] = 0;
        char *url = req + 4; char *sp = strchr(url, ' '); if (sp) *sp = 0;
        char *qm = strchr(url, '?'); if (qm) *qm = 0;
        char fpath[512]; char *fp = find_file(url, fpath, sizeof(fpath));
        if (!fp) { const char *nf = "HTTP/1.1 404 Not Found\r\nContent-Length:0\r\n\r\n"; write(c,nf,strlen(nf)); close(c); continue; }
        struct stat st; stat(fp, &st);
        const char *dot = strrchr(fp, '.'); const char *ct = mime(dot?dot:"");
        char hdr[512]; int hlen = snprintf(hdr,sizeof(hdr),
            "HTTP/1.1 200 OK\r\nContent-Type:%s\r\nContent-Length:%ld\r\nCache-Control:%s\r\nAccess-Control-Allow-Origin:*\r\n\r\n",
            ct,(long)st.st_size,strstr(ct,"html")?"no-store":"public,max-age=31536000");
        write(c,hdr,hlen);
        int fd = open(fp,O_RDONLY); char buf[BUFSIZE]; ssize_t r;
        while((r=read(fd,buf,BUFSIZE))>0) write(c,buf,r);
        close(fd); close(c);
    }
    return 0;
}
