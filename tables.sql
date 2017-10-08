create table if not exists devices (
	brand text not null,
	model text not null,
	versions text,
	current text no null,
	target text not null,
	subtarget text not null,
	primary key(brand, model, versions)
);
