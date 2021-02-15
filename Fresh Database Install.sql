create table sessions
(
    sid     TEXT,
    data    TEXT,
    expires INTEGER,
    primary key (sid)
);

create table user_chapter_read
(
    id           INTEGER     not null,
    userId       INTEGER     not null,
    chapter      VARCHAR(45) not null,
    lastReadDate DATE        not null,
    constraint user_chapter_read_pk
        primary key (id autoincrement)
);

create unique index user_chapter_read_uniq
    on user_chapter_read (userId, chapter);

create table users
(
    id                   INTEGER      not null,
    name                 VARCHAR(255) not null,
    username             VARCHAR(255) not null,
    password             TEXT,
    lastLoginDt          TIMESTAMP,
    passwordResetToken   VARCHAR(32),
    passwordResetExpires TIMESTAMP,
    theme                varchar,
    constraint users_pk
        primary key (id autoincrement)
);

create unique index users_passwordResetToken_uindex
    on users (passwordResetToken);

create unique index users_username_uindex
    on users (username);


