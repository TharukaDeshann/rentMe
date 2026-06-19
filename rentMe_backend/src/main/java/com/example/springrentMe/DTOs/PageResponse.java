package com.example.springrentMe.DTOs;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Standard paginated response envelope.
 *
 * Every list-returning endpoint wraps its Spring {@link Page} result in this
 * class before returning it to the client, producing a consistent JSON shape:
 *
 * <pre>
 * {
 *   "data": [ … ],
 *   "meta": {
 *     "page": 0,
 *     "size": 20,
 *     "totalElements": 523,
 *     "totalPages": 27,
 *     "first": true,
 *     "last": false
 *   }
 * }
 * </pre>
 *
 * Usage:
 * <pre>
 *   Page&lt;MyDTO&gt; page = service.listItems(pageable);
 *   return ResponseEntity.ok(PageResponse.of(page));
 * </pre>
 */
public class PageResponse<T> {

    private List<T> data;
    private Meta    meta;

    // ─── Constructors ──────────────────────────────────────────────────────────

    public PageResponse() {}

    private PageResponse(List<T> data, Meta meta) {
        this.data = data;
        this.meta = meta;
    }

    // ─── Factory ───────────────────────────────────────────────────────────────

    /**
     * Build a {@code PageResponse} from a Spring {@link Page}.
     *
     * @param page the Spring page returned by a repository/service
     * @param <T>  the DTO type contained in the page
     * @return     wrapped response
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        Meta meta = new Meta(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
        return new PageResponse<>(page.getContent(), meta);
    }

    // ─── Getters / Setters ─────────────────────────────────────────────────────

    public List<T> getData()       { return data; }
    public void    setData(List<T> data) { this.data = data; }

    public Meta getMeta()          { return meta; }
    public void setMeta(Meta meta) { this.meta = meta; }

    // ─── Inner class ───────────────────────────────────────────────────────────

    public static class Meta {
        private int  page;
        private int  size;
        private long totalElements;
        private int  totalPages;
        private boolean first;
        private boolean last;

        public Meta() {}

        public Meta(int page, int size, long totalElements,
                    int totalPages, boolean first, boolean last) {
            this.page          = page;
            this.size          = size;
            this.totalElements = totalElements;
            this.totalPages    = totalPages;
            this.first         = first;
            this.last          = last;
        }

        public int     getPage()          { return page; }
        public void    setPage(int page)  { this.page = page; }

        public int     getSize()          { return size; }
        public void    setSize(int size)  { this.size = size; }

        public long    getTotalElements()             { return totalElements; }
        public void    setTotalElements(long totalElements) { this.totalElements = totalElements; }

        public int     getTotalPages()              { return totalPages; }
        public void    setTotalPages(int totalPages){ this.totalPages = totalPages; }

        public boolean isFirst()            { return first; }
        public void    setFirst(boolean first){ this.first = first; }

        public boolean isLast()             { return last; }
        public void    setLast(boolean last) { this.last = last; }
    }
}
